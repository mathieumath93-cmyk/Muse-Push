import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeZoneRadar } from './components/TimeZoneRadar';
import { CleanStudioConfig } from './components/CleanStudioConfig';
import { VariationsDisplay } from './components/VariationsDisplay';
import { OpenRouterModal } from './components/OpenRouterModal';
import { TrainingStudio } from './components/TrainingStudio';
import { AddModelModal } from './components/AddModelModal';
import { INITIAL_MODELS, DEFAULT_WINNING_EXAMPLES } from './data';
import { executePushGeneration } from './services/aiGenerator';
import { 
  subscribeModels, 
  saveModelToCloud, 
  deleteModelFromCloud,
  subscribeTrainingExamples,
  saveTrainingExampleToCloud,
  deleteTrainingExampleFromCloud,
  subscribePlaybookRules,
  savePlaybookRulesToCloud
} from './lib/firebase';
import { 
  Platform, 
  Language, 
  MoodCategory, 
  ModelProfile, 
  PushRequestConfig, 
  GenerationResult,
  WinningExample
} from './types';
import { Sparkles, RefreshCw, Trophy, Zap, AlertCircle } from 'lucide-react';

export default function App() {
  // Navigation tabs: 'generator' or 'training'
  const [activeTab, setActiveTab] = useState<'generator' | 'training'>('generator');

  // Cloud sync status
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // Models management
  const [models, setModels] = useState<ModelProfile[]>(() => {
    const saved = localStorage.getItem('musepush_models');
    return saved ? JSON.parse(saved) : INITIAL_MODELS;
  });
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || 'sophia');
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelProfile | null>(null);

  // Platform & Language
  const [platform, setPlatform] = useState<Platform>('onlyfans');
  const [language, setLanguage] = useState<Language>('fr');
  const [selectedMood, setSelectedMood] = useState<MoodCategory>('hot');

  // OpenRouter & LLM settings
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>(() => {
    return localStorage.getItem('musepush_openrouter_key') || '';
  });
  const [selectedLlmModel, setSelectedLlmModel] = useState<string>('anthropic/claude-3.5-sonnet');
  const [temperature, setTemperature] = useState<number>(0.85);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Training examples (Few-shot learning) & Agency rules
  const [trainingExamples, setTrainingExamples] = useState<WinningExample[]>(() => {
    const saved = localStorage.getItem('musepush_training_examples');
    return saved ? JSON.parse(saved) : DEFAULT_WINNING_EXAMPLES;
  });

  const [agencyPlaybookRules, setAgencyPlaybookRules] = useState<string>(() => {
    return localStorage.getItem('musepush_playbook_rules') || 
`- Le fan est DÉJÀ en train de lire le message en DM : INTERDICTION STRICTE de dire "viens en DM" ou "réponds-moi en DM".
- Privilégier le style direct, percutant et simple : jusqu'à 1 seule phrase percutante sans blabla inutile.
- Commencer fréquemment la première ligne sans majuscule pour donner un effet vrai SMS spontané.
- Zéro vocabulaire commercial ("promotion", "offre spéciale", "abonne-toi").
- Cadre 100% maison/appartement (miroir de chambre, lit, couette, douche, unboxing lingerie reçue).`;
  });

  // Real-time Firebase Cloud Synchronization
  useEffect(() => {
    let unsubModels: (() => void) | undefined;
    let unsubTraining: (() => void) | undefined;
    let unsubPlaybook: (() => void) | undefined;

    try {
      unsubModels = subscribeModels((cloudModels) => {
        if (cloudModels && cloudModels.length > 0) {
          setModels(cloudModels);
          localStorage.setItem('musepush_models', JSON.stringify(cloudModels));
          setIsCloudSynced(true);
        }
      });

      unsubTraining = subscribeTrainingExamples((cloudExamples) => {
        if (cloudExamples && cloudExamples.length > 0) {
          setTrainingExamples(cloudExamples);
          localStorage.setItem('musepush_training_examples', JSON.stringify(cloudExamples));
          setIsCloudSynced(true);
        }
      });

      unsubPlaybook = subscribePlaybookRules((cloudRules) => {
        if (cloudRules) {
          setAgencyPlaybookRules(cloudRules);
          localStorage.setItem('musepush_playbook_rules', cloudRules);
          setIsCloudSynced(true);
        }
      });
    } catch (e) {
      console.warn('[Firebase] subscription error, local storage fallback active:', e);
    }

    return () => {
      if (unsubModels) unsubModels();
      if (unsubTraining) unsubTraining();
      if (unsubPlaybook) unsubPlaybook();
    };
  }, []);

  // Push request config
  const [config, setConfig] = useState<PushRequestConfig>({
    modelId: 'eden',
    platform: 'onlyfans',
    language: 'fr',
    pushType: 'paid_ppv',
    sentenceCount: 'one_line',
    varietyLevel: 'high',
    mood: 'hot',
    mediaType: 'video_clip',
    priceSuggestion: 15,
    mediaContext: "Sous les draps en train de me toucher doucement, la lumière tamisée de ma lampe de chevet...",
    callToAction: 'unlock_ppv',
    targetAudience: 'all_subs',
    hotLevel: 4,
    timeContext: {
      selectedTzZone: 'FR_CET',
      useCurrentTime: true
    }
  });

  const handleConfigChange = (updated: Partial<PushRequestConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updated };
      if (updated.varietyLevel) {
        // Auto-adjust temperature based on varietyLevel (low: 0.40, medium: 0.75, high: 1.10)
        const autoTemp = updated.varietyLevel === 'high' ? 1.10 : (updated.varietyLevel === 'low' ? 0.40 : 0.75);
        setTemperature(autoTemp);
      }
      return next;
    });
  };

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  // Keep state synced
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      modelId: selectedModelId,
      platform,
      language,
      mood: selectedMood
    }));
  }, [selectedModelId, platform, language, selectedMood]);

  const selectedModel = models.find(m => m.id === selectedModelId) || models[0];

  const handleSelectModel = (id: string) => {
    setSelectedModelId(id);
    const target = models.find(m => m.id === id);
    if (target?.defaultLanguage) {
      setLanguage(target.defaultLanguage);
    }
  };

  const handleSaveModel = (modelToSave: ModelProfile) => {
    const existingIndex = models.findIndex(m => m.id === modelToSave.id);
    let updated: ModelProfile[];
    if (existingIndex >= 0) {
      updated = [...models];
      updated[existingIndex] = modelToSave;
    } else {
      updated = [modelToSave, ...models];
    }
    setModels(updated);
    setSelectedModelId(modelToSave.id);
    if (modelToSave.defaultLanguage) {
      setLanguage(modelToSave.defaultLanguage);
    }
    localStorage.setItem('musepush_models', JSON.stringify(updated));
    saveModelToCloud(modelToSave).catch(err => {
      console.error('[Firebase] Error saving model to cloud:', err);
    });
  };

  const handleOpenAddModel = () => {
    setEditingModel(null);
    setIsAddModelOpen(true);
  };

  const handleOpenEditModel = (model: ModelProfile) => {
    setEditingModel(model);
    setIsAddModelOpen(true);
  };

  const handleDeleteModel = (id: string) => {
    if (models.length <= 1) return;
    const updated = models.filter(m => m.id !== id);
    setModels(updated);
    if (selectedModelId === id) {
      const next = updated[0];
      setSelectedModelId(next.id);
      if (next?.defaultLanguage) {
        setLanguage(next.defaultLanguage);
      }
    }
    localStorage.setItem('musepush_models', JSON.stringify(updated));
    deleteModelFromCloud(id).catch(err => {
      console.error('[Firebase] Error deleting model from cloud:', err);
    });
  };

  const handleDuplicateModel = (model: ModelProfile) => {
    const clone: ModelProfile = {
      ...model,
      id: 'model-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      name: `${model.name} (Copie)`,
    };
    const updated = [clone, ...models];
    setModels(updated);
    setSelectedModelId(clone.id);
    localStorage.setItem('musepush_models', JSON.stringify(updated));
    saveModelToCloud(clone).catch(err => {
      console.error('[Firebase] Error saving cloned model to cloud:', err);
    });
  };

  const handleAddTrainingExample = (item: WinningExample) => {
    const updated = [item, ...trainingExamples];
    setTrainingExamples(updated);
    localStorage.setItem('musepush_training_examples', JSON.stringify(updated));
    saveTrainingExampleToCloud(item).catch(err => {
      console.error('[Firebase] Error saving training example to cloud:', err);
    });
  };

  const handleDeleteTrainingExample = (id: string) => {
    const updated = trainingExamples.filter(x => x.id !== id);
    setTrainingExamples(updated);
    localStorage.setItem('musepush_training_examples', JSON.stringify(updated));
    deleteTrainingExampleFromCloud(id).catch(err => {
      console.error('[Firebase] Error deleting training example from cloud:', err);
    });
  };

  const handleChangePlaybookRules = (rules: string) => {
    setAgencyPlaybookRules(rules);
    localStorage.setItem('musepush_playbook_rules', rules);
    savePlaybookRulesToCloud(rules).catch(err => {
      console.error('[Firebase] Error saving playbook rules to cloud:', err);
    });
  };

  const handleSaveApiKey = (key: string) => {
    setOpenRouterApiKey(key);
    localStorage.setItem('musepush_openrouter_key', key);
  };

  const handleGeneratePush = async () => {
    setIsGenerating(true);
    try {
      // Filter relevant training examples by platform and language, or pass top 4
      const relevantTraining = trainingExamples.filter(
        ex => ex.language === language || ex.platform === platform
      ).slice(0, 4);

      // Auto-adjust temperature based on varietyLevel (low: 0.40, medium: 0.75, high: 1.10)
      const effectiveTemperature = config.varietyLevel === 'high'
        ? 1.10
        : (config.varietyLevel === 'low' ? 0.40 : 0.75);

      const result = await executePushGeneration({
        modelProfile: selectedModel,
        platform,
        language,
        pushType: config.pushType,
        sentenceCount: config.sentenceCount,
        varietyLevel: config.varietyLevel || 'high',
        mood: selectedMood,
        mediaType: config.mediaType,
        priceSuggestion: config.priceSuggestion,
        mediaContext: config.mediaContext,
        callToAction: config.callToAction,
        targetAudience: config.targetAudience,
        hotLevel: config.hotLevel,
        timeContext: config.timeContext,
        trainingExamples: relevantTraining,
        agencyPlaybookRules,
        openRouterConfig: {
          apiKey: openRouterApiKey,
          model: selectedLlmModel,
          temperature: effectiveTemperature
        }
      });

      if (result && result.success) {
        setGenerationResult(result);
      } else {
        alert('Erreur lors de la génération du push.');
      }
    } catch (err: any) {
      console.error('Error generating push:', err);
      alert('Une erreur inattendue est survenue lors de la génération.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080c] text-zinc-100 selection:bg-rose-500 selection:text-white flex flex-col font-sans">
      {/* Unified Header */}
      <Header
        platform={platform}
        language={language}
        onSelectPlatform={setPlatform}
        onSelectLanguage={setLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={Boolean(openRouterApiKey)}
        selectedModel={selectedLlmModel}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        trainingCount={trainingExamples.length}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5">
        {/* Real-time Timezone Radar always accessible at the top */}
        <TimeZoneRadar
          selectedZone={config.timeContext.selectedTzZone}
          onSelectZone={(zoneId) => {
            setConfig(prev => ({
              ...prev,
              timeContext: { ...prev.timeContext, selectedTzZone: zoneId }
            }));
          }}
        />

        {/* Tab 1: Clean & Intuitive Push Generator */}
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left side: Single, streamlined configuration card */}
            <div className="lg:col-span-5 space-y-4">
              <CleanStudioConfig
                models={models}
                selectedModelId={selectedModelId}
                onSelectModel={handleSelectModel}
                onEditModel={handleOpenEditModel}
                onDuplicateModel={handleDuplicateModel}
                onDeleteModel={handleDeleteModel}
                selectedMood={selectedMood}
                onSelectMood={setSelectedMood}
                config={config}
                onChangeConfig={handleConfigChange}
                language={language}
                onSelectLanguage={setLanguage}
                onOpenAddModel={handleOpenAddModel}
              />

              {/* High-visibility Generate Trigger */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGeneratePush}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:from-rose-600 hover:via-pink-700 hover:to-purple-700 active:scale-[0.99] text-white font-bold text-sm shadow-[0_0_25px_rgba(244,63,94,0.25)] flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Rédaction IA selon ton entraînement...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-rose-200" />
                      <span>Générer les 6 Pushs (A/B Testing)</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between px-2 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" /> {trainingExamples.length} exemples d'entraînement
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-zinc-400">
                      Variété : <strong className={config.varietyLevel === 'high' ? 'text-amber-400 font-semibold' : config.varietyLevel === 'low' ? 'text-blue-400' : 'text-zinc-200'}>
                        {config.varietyLevel === 'high' ? 'Élevée (T: 1.10)' : config.varietyLevel === 'low' ? 'Faible (T: 0.40)' : 'Moyenne (T: 0.75)'}
                      </strong>
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right side: Generated variations & realistic smartphone preview */}
            <div className="lg:col-span-7">
              <VariationsDisplay
                result={generationResult}
                loading={isGenerating}
                platform={platform}
                modelName={selectedModel.name}
                pushType={config.pushType}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Training Studio (Few-Shot fine-tuning & Playbook) */}
        {activeTab === 'training' && (
          <TrainingStudio
            examples={trainingExamples}
            onAddExample={handleAddTrainingExample}
            onDeleteExample={handleDeleteTrainingExample}
            playbookRules={agencyPlaybookRules}
            onChangePlaybookRules={handleChangePlaybookRules}
          />
        )}
      </main>

      {/* Add / Edit Model Modal */}
      <AddModelModal
        isOpen={isAddModelOpen}
        onClose={() => {
          setIsAddModelOpen(false);
          setEditingModel(null);
        }}
        onSave={handleSaveModel}
        initialModel={editingModel}
      />

      {/* OpenRouter Config Modal */}
      <OpenRouterModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={openRouterApiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedLlmModel}
        onSelectModel={setSelectedLlmModel}
        temperature={temperature}
        onSetTemperature={setTemperature}
      />

      {/* Subtle compact footer */}
      <footer className="border-t border-white/5 py-3 px-4 text-center text-xs text-zinc-500 bg-[#07070a]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span>MusePush Studio • Entraînement Few-Shot & Optimisation Mass Messaging (OnlyFans / MYM)</span>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">● Moteur persuasion actif</span>
            <span>Fuseaux FR & US synchronisés</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
