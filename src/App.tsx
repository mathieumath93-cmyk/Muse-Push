import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimeZoneRadar } from './components/TimeZoneRadar';
import { CleanStudioConfig } from './components/CleanStudioConfig';
import { VariationsDisplay } from './components/VariationsDisplay';
import { OpenRouterModal } from './components/OpenRouterModal';
import { TrainingStudio } from './components/TrainingStudio';
import { AddModelModal } from './components/AddModelModal';
import { INITIAL_MODELS, DEFAULT_WINNING_EXAMPLES } from './data';
import { executePushGeneration, testOpenRouterConnection, testGroqConnection, testMistralConnection } from './services/aiGenerator';
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
  WinningExample,
  OpenRouterTestResult,
  AiProviderId
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

  // Active Provider selection: 'groq' | 'mistral' | 'openrouter' | 'studio'
  const [activeProvider, setActiveProvider] = useState<AiProviderId>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('musepush_active_provider') : null;
    return (saved as AiProviderId) || 'groq';
  });
  const handleSelectProvider = (prov: AiProviderId) => {
    setActiveProvider(prov);
    if (typeof window !== 'undefined') {
      localStorage.setItem('musepush_active_provider', prov);
    }
  };

  // Groq settings
  const [groqApiKey, setGroqApiKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('musepush_groq_key') || '' : '';
  });
  const [groqModel, setGroqModel] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('musepush_groq_model') || 'llama-3.3-70b-versatile' : 'llama-3.3-70b-versatile';
  });
  const [groqStatus, setGroqStatus] = useState<OpenRouterTestResult | null>(null);
  const [isTestingGroq, setIsTestingGroq] = useState<boolean>(false);

  const handleSaveGroqApiKey = (key: string) => {
    setGroqApiKey(key);
    if (typeof window !== 'undefined') localStorage.setItem('musepush_groq_key', key);
    if (key.trim()) handleTestGroq(key);
  };
  const handleSelectGroqModel = (model: string) => {
    setGroqModel(model);
    if (typeof window !== 'undefined') localStorage.setItem('musepush_groq_model', model);
  };
  const handleTestGroq = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : groqApiKey;
    if (!key.trim()) {
      setGroqStatus({ success: false, status: 'error', message: 'Aucune clé Groq renseignée.' });
      return;
    }
    setIsTestingGroq(true);
    try {
      const res = await testGroqConnection(key, groqModel);
      setGroqStatus(res);
    } catch (e: any) {
      setGroqStatus({ success: false, status: 'error', message: e?.message || 'Erreur de test Groq.' });
    } finally {
      setIsTestingGroq(false);
    }
  };

  // Mistral settings
  const [mistralApiKey, setMistralApiKey] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('musepush_mistral_key') || '' : '';
  });
  const [mistralModel, setMistralModel] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('musepush_mistral_model') || 'mistral-small-latest' : 'mistral-small-latest';
  });
  const [mistralStatus, setMistralStatus] = useState<OpenRouterTestResult | null>(null);
  const [isTestingMistral, setIsTestingMistral] = useState<boolean>(false);

  const handleSaveMistralApiKey = (key: string) => {
    setMistralApiKey(key);
    if (typeof window !== 'undefined') localStorage.setItem('musepush_mistral_key', key);
    if (key.trim()) handleTestMistral(key);
  };
  const handleSelectMistralModel = (model: string) => {
    setMistralModel(model);
    if (typeof window !== 'undefined') localStorage.setItem('musepush_mistral_model', model);
  };
  const handleTestMistral = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : mistralApiKey;
    if (!key.trim()) {
      setMistralStatus({ success: false, status: 'error', message: 'Aucune clé Mistral renseignée.' });
      return;
    }
    setIsTestingMistral(true);
    try {
      const res = await testMistralConnection(key, mistralModel);
      setMistralStatus(res);
    } catch (e: any) {
      setMistralStatus({ success: false, status: 'error', message: e?.message || 'Erreur de test Mistral.' });
    } finally {
      setIsTestingMistral(false);
    }
  };

  // OpenRouter & LLM settings
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>(() => {
    return localStorage.getItem('musepush_openrouter_key') || '';
  });
  const [selectedLlmModel, setSelectedLlmModel] = useState<string>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('musepush_openrouter_model') : null;
    if (!saved || saved === 'anthropic/claude-3.5-sonnet' || saved === '@preset/push-bot') {
      if (typeof window !== 'undefined') localStorage.setItem('musepush_openrouter_model', 'openrouter/free');
      return 'openrouter/free';
    }
    return saved;
  });

  const handleSelectLlmModel = (model: string) => {
    setSelectedLlmModel(model);
    if (typeof window !== 'undefined') {
      localStorage.setItem('musepush_openrouter_model', model);
    }
  };
  const [temperature, setTemperature] = useState<number>(0.85);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [openRouterStatus, setOpenRouterStatus] = useState<OpenRouterTestResult | null>(null);
  const [isTestingOpenRouter, setIsTestingOpenRouter] = useState<boolean>(false);

  // Test OpenRouter connection function
  const handleTestOpenRouter = async (keyToTest?: string) => {
    const key = keyToTest !== undefined ? keyToTest : openRouterApiKey;
    if (!key.trim()) {
      setOpenRouterStatus({
        success: false,
        status: 'error',
        message: 'Aucune clé OpenRouter renseignée.'
      });
      return;
    }
    setIsTestingOpenRouter(true);
    try {
      const res = await testOpenRouterConnection(key, selectedLlmModel);
      setOpenRouterStatus(res);
    } catch (e: any) {
      setOpenRouterStatus({
        success: false,
        status: 'error',
        message: e?.message || 'Erreur de connexion OpenRouter.'
      });
    } finally {
      setIsTestingOpenRouter(false);
    }
  };

  // Check providers on load if key exists
  useEffect(() => {
    if (groqApiKey && groqApiKey.trim().length > 5) {
      handleTestGroq(groqApiKey);
    }
    if (mistralApiKey && mistralApiKey.trim().length > 5) {
      handleTestMistral(mistralApiKey);
    }
    if (openRouterApiKey && openRouterApiKey.trim().length > 5) {
      handleTestOpenRouter(openRouterApiKey);
    }
  }, []);

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

  const handleSelectLanguage = (newLang: Language) => {
    setLanguage(newLang);
    const defaultFr = "Sous les draps en train de me toucher doucement, la lumière tamisée de ma lampe de chevet...";
    const defaultUs = "Under the sheets touching myself slowly, with the soft dim light of my bedside lamp on...";
    setConfig(prev => {
      let nextMediaContext = prev.mediaContext;
      if (newLang === 'us' && (!nextMediaContext || nextMediaContext === defaultFr)) {
        nextMediaContext = defaultUs;
      } else if (newLang === 'fr' && (!nextMediaContext || nextMediaContext === defaultUs)) {
        nextMediaContext = defaultFr;
      }
      return {
        ...prev,
        language: newLang,
        mediaContext: nextMediaContext
      };
    });
  };

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [generatedMessagesHistory, setGeneratedMessagesHistory] = useState<string[]>([]);

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
    if (key.trim()) {
      handleTestOpenRouter(key);
    } else {
      setOpenRouterStatus(null);
    }
  };

  const handleGeneratePush = async () => {
    // Strict lock: only 1 request at a time to prevent any quota spam
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      // Filter relevant training examples strictly by language to never contaminate US generation with French text
      const relevantTraining = trainingExamples.filter(
        ex => ex.language === language
      ).slice(0, 4);

      // Auto-adjust temperature based on varietyLevel (low: 0.40, medium: 0.75, high: 1.10)
      const effectiveTemperature = config.varietyLevel === 'high'
        ? 1.10
        : (config.varietyLevel === 'low' ? 0.40 : 0.75);

      // Collect all recently generated messages to strictly enforce novelty and ban repetition
      const previousMessagesToAvoid = Array.from(new Set([
        ...generatedMessagesHistory,
        ...(generationResult?.variations?.map(v => v.message).filter(Boolean) || [])
      ])).slice(-25);

      // Adapt playbook rules to the selected language
      const effectivePlaybookRules = language === 'us'
        ? `- The subscriber is ALREADY inside his DM inbox: STRICTLY FORBIDDEN to say "DM me" or "text me in DM".
- Strictly respect the requested sentence length (${config.sentenceCount}) with zero fluff.
- Frequently start the first sentence in lowercase for real spontaneous texting realism.
- Zero commercial marketing words ("promotion", "special offer", "subscribe").
- 100% realistic bedroom/home setting (bedroom mirror, bed, sheets, shower, lingerie haul).`
        : agencyPlaybookRules;

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
        previousMessages: previousMessagesToAvoid,
        trainingExamples: relevantTraining,
        agencyPlaybookRules: effectivePlaybookRules,
        activeProvider,
        groqConfig: {
          apiKey: groqApiKey,
          model: groqModel
        },
        mistralConfig: {
          apiKey: mistralApiKey,
          model: mistralModel
        },
        openRouterConfig: {
          apiKey: openRouterApiKey,
          model: selectedLlmModel,
          temperature: effectiveTemperature
        }
      });

      if (result && result.success) {
        setGenerationResult(result);
        if (Array.isArray(result.variations)) {
          const freshTexts = result.variations.map(v => v.message).filter(Boolean);
          setGeneratedMessagesHistory(prev => Array.from(new Set([...prev, ...freshTexts])).slice(-30));
        }

        const pStatus = (result as any).providerStatus || result.openRouterStatus;
        if (pStatus) {
          const errStr = pStatus.error || '';
          const isRateLimit = errStr.includes('20 req/min') || errStr.includes('Quota') || errStr.includes('rate limit') || errStr.includes('429') || errStr.includes('saturé');

          const formattedStatus: OpenRouterTestResult = {
            success: pStatus.success,
            status: pStatus.success
              ? 'connected'
              : (isRateLimit ? 'warning' : 'error'),
            message: pStatus.success 
              ? `Généré avec succès via ${result.modelUsed}`
              : (isRateLimit
                  ? 'Modèle saturé (429) — Moteur Studio actif en relais instantané'
                  : (pStatus.error || 'Erreur API externe')),
            latencyMs: pStatus.latencyMs,
            creditInfo: pStatus.creditInfo
          };

          if (activeProvider === 'groq') {
            setGroqStatus(formattedStatus);
          } else if (activeProvider === 'mistral') {
            setMistralStatus(formattedStatus);
          } else {
            setOpenRouterStatus(formattedStatus);
          }
        }
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
        onSelectLanguage={handleSelectLanguage}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={
          activeProvider === 'studio'
            ? true
            : activeProvider === 'groq'
            ? Boolean(groqApiKey)
            : activeProvider === 'mistral'
            ? Boolean(mistralApiKey)
            : Boolean(openRouterApiKey)
        }
        selectedModel={
          activeProvider === 'groq'
            ? groqModel
            : activeProvider === 'mistral'
            ? mistralModel
            : selectedLlmModel
        }
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        trainingCount={trainingExamples.length}
        isCloudSynced={isCloudSynced}
        activeProvider={activeProvider}
        openRouterStatus={
          activeProvider === 'groq'
            ? groqStatus
            : activeProvider === 'mistral'
            ? mistralStatus
            : openRouterStatus
        }
        isTestingOpenRouter={
          activeProvider === 'groq'
            ? isTestingGroq
            : activeProvider === 'mistral'
            ? isTestingMistral
            : isTestingOpenRouter
        }
        onTestOpenRouter={() => {
          if (activeProvider === 'groq') handleTestGroq();
          else if (activeProvider === 'mistral') handleTestMistral();
          else if (activeProvider === 'openrouter') handleTestOpenRouter();
        }}
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
                onSelectLanguage={handleSelectLanguage}
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
                onRegenerateFresh={handleGeneratePush}
                onResetHistory={() => setGeneratedMessagesHistory([])}
                historyCount={generatedMessagesHistory.length}
                selectedLlmModel={selectedLlmModel}
                onSelectLlmModel={(newModel) => {
                  setSelectedLlmModel(newModel);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('musepush_openrouter_model', newModel);
                  }
                }}
                onOpenSettings={() => setIsSettingsOpen(true)}
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

      {/* Multi-Provider Hub Config Modal */}
      <OpenRouterModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeProvider={activeProvider}
        onSelectProvider={handleSelectProvider}
        groqApiKey={groqApiKey}
        onSaveGroqApiKey={handleSaveGroqApiKey}
        groqModel={groqModel}
        onSelectGroqModel={handleSelectGroqModel}
        groqStatus={groqStatus}
        onTestGroq={handleTestGroq}
        isTestingGroq={isTestingGroq}
        mistralApiKey={mistralApiKey}
        onSaveMistralApiKey={handleSaveMistralApiKey}
        mistralModel={mistralModel}
        onSelectMistralModel={handleSelectMistralModel}
        mistralStatus={mistralStatus}
        onTestMistral={handleTestMistral}
        isTestingMistral={isTestingMistral}
        apiKey={openRouterApiKey}
        onSaveApiKey={handleSaveApiKey}
        selectedModel={selectedLlmModel}
        onSelectModel={handleSelectLlmModel}
        temperature={temperature}
        onSetTemperature={setTemperature}
        openRouterStatus={openRouterStatus}
        isTesting={isTestingOpenRouter}
        onTestConnection={handleTestOpenRouter}
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
