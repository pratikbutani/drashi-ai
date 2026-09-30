import { AssistiveMode, Language } from '../types';

export interface TranslationSchema {
  appTitle: string;
  tagline: string;
  selectLanguageTitle: string;
  selectLanguageDesc: string;
  pressKeyToSelect: string;
  voiceSelectHint: string;
  listeningVoice: string;
  languages: {
    en: string;
    hi: string;
    gu: string;
  };
  modes: Record<AssistiveMode, { title: string; desc: string; iconLabel: string }>;
  camera: {
    startCamera: string;
    cameraRunning: string;
    flipCamera: string;
    turnOnFlash: string;
    turnOffFlash: string;
    captureSnapshot: string;
    analyzingView: string;
    recordVideoClip: string;
    recordingClip: string;
    stopRecording: string;
    uploadFile: string;
    continuousOn: string;
    continuousOff: string;
    continuousDesc: string;
  };
  analysis: {
    summary: string;
    spokenNarrative: string;
    hazardsTitle: string;
    noHazards: string;
    spatialTitle: string;
    textDetectedTitle: string;
    currencyDetectedTitle: string;
    suggestedActionTitle: string;
    repeatAudio: string;
    stopAudio: string;
    speakingNow: string;
    reAnalyze: string;
    safetySafe: string;
    safetyCaution: string;
    safetyDanger: string;
  };
  askQuestion: {
    buttonTitle: string;
    modalTitle: string;
    inputPlaceholder: string;
    speakButton: string;
    listening: string;
    submit: string;
    cancel: string;
  };
  settings: {
    title: string;
    highContrast: string;
    contrastThemes: {
      yellowBlack: string;
      whiteBlack: string;
      cyanBlack: string;
      blackWhite: string;
    };
    textSize: string;
    speechSpeed: string;
    speechEngine: string;
    neuralVoice: string;
    browserVoice: string;
    close: string;
  };
  keyboardShortcuts: {
    title: string;
    space: string;
    keys123: string;
    keyS: string;
    keyR: string;
    keyC: string;
    keyM: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  en: {
    appTitle: 'Drishti AI',
    tagline: 'Visual Assistant & Scene Explainer for the Visually Impaired',
    selectLanguageTitle: 'Select Your Preferred Language',
    selectLanguageDesc: 'Before analyzing camera feed, please choose your preferred language for all audio explanations.',
    pressKeyToSelect: 'Press 1 for English, 2 for Hindi, 3 for Gujarati',
    voiceSelectHint: 'Or tap microphone and say "English", "Hindi", or "Gujarati"',
    listeningVoice: 'Listening for your language choice...',
    languages: {
      en: 'English (US/UK)',
      hi: 'हिन्दी - Hindi',
      gu: 'ગુજરાતી - Gujarati',
    },
    modes: {
      general: {
        title: 'Scene & Safety',
        desc: 'Walking path, obstacles, stairs, doors & surrounding people',
        iconLabel: 'General Scene and Safety Mode',
      },
      text_ocr: {
        title: 'Read Text & Docs',
        desc: 'Labels, signboards, prescriptions, bills & documents',
        iconLabel: 'Text Reading Mode',
      },
      currency: {
        title: 'Money & Currency',
        desc: 'Banknote denominations (₹ / $), coins & cash verification',
        iconLabel: 'Currency Recognition Mode',
      },
      objects_colors: {
        title: 'Objects & Colors',
        desc: 'Find items, clothes colors & positions on clock-face',
        iconLabel: 'Objects and Colors Finder Mode',
      },
      question: {
        title: 'Ask Question',
        desc: 'Ask any specific question using your voice about what is visible',
        iconLabel: 'Voice Query Mode',
      },
    },
    camera: {
      startCamera: 'Start Camera',
      cameraRunning: 'Camera Active',
      flipCamera: 'Switch Camera',
      turnOnFlash: 'Turn On Torch',
      turnOffFlash: 'Turn Off Torch',
      captureSnapshot: 'Analyze Current View',
      analyzingView: 'Analyzing visual scene, please hold still...',
      recordVideoClip: 'Record 3-Sec Video Clip',
      recordingClip: 'Recording 3-second motion clip...',
      stopRecording: 'Stop Clip',
      uploadFile: 'Upload Image or Video',
      continuousOn: 'Auto-Guide Active',
      continuousOff: 'Start Live Auto-Guide',
      continuousDesc: 'Continuously announces path updates every 4 seconds',
    },
    analysis: {
      summary: 'Immediate Summary',
      spokenNarrative: 'Full Spoken Description',
      hazardsTitle: 'Safety Warnings & Obstacles',
      noHazards: 'No immediate tripping hazards or drop-offs detected.',
      spatialTitle: 'Object & Spatial Positions',
      textDetectedTitle: 'Recognized Text / Signs',
      currencyDetectedTitle: 'Identified Currency',
      suggestedActionTitle: 'Recommended Navigation Action',
      repeatAudio: 'Replay Spoken Guide',
      stopAudio: 'Stop Speaking',
      speakingNow: 'Speaking now...',
      reAnalyze: 'Analyze Again',
      safetySafe: 'Safe Path',
      safetyCaution: 'Proceed with Caution',
      safetyDanger: 'Warning: Immediate Obstacle / Hazard',
    },
    askQuestion: {
      buttonTitle: 'Ask Drishti with Voice',
      modalTitle: 'Ask Any Question About What You See',
      inputPlaceholder: 'e.g., Where is my water bottle? What does this paper say?',
      speakButton: 'Tap to Speak Question',
      listening: 'Listening to your voice...',
      submit: 'Analyze & Answer',
      cancel: 'Cancel',
    },
    settings: {
      title: 'Accessibility Preferences',
      highContrast: 'High Contrast Mode',
      contrastThemes: {
        yellowBlack: 'Yellow on Pitch Black (Recommended)',
        whiteBlack: 'White on Pitch Black',
        cyanBlack: 'Cyan on Dark Blue',
        blackWhite: 'Black on White',
      },
      textSize: 'Text Size',
      speechSpeed: 'Speech Rate',
      speechEngine: 'Voice Technology',
      neuralVoice: 'Gemini Neural Voice (Rich & Natural)',
      browserVoice: 'Instant Device Voice (Fastest)',
      close: 'Save & Close',
    },
    keyboardShortcuts: {
      title: 'Accessible Keyboard Shortcuts',
      space: 'SPACE: Capture & Analyze Scene',
      keys123: '1, 2, 3: Switch Language (En, Hi, Gu)',
      keyS: 'S: Stop Audio Speaking',
      keyR: 'R: Replay Audio Explanation',
      keyC: 'C: Toggle Continuous Auto-Guide',
      keyM: 'M: Cycle Through Modes',
    },
  },

  hi: {
    appTitle: 'दृष्टि एआई (Drishti AI)',
    tagline: 'नेत्रहीन और दृष्टिबाधित मित्रों के लिए दृश्य व्याख्या और ऑडियो गाइड',
    selectLanguageTitle: 'अपनी पसंदीदा भाषा चुनें',
    selectLanguageDesc: 'कैमरा विश्लेषण से पहले, कृपया वह भाषा चुनें जिसमें आप ऑडियो सुनना चाहते हैं।',
    pressKeyToSelect: 'अंग्रेज़ी के लिए 1, हिन्दी के लिए 2, गुजराती के लिए 3 दबाएं',
    voiceSelectHint: 'या माइक दबाकर बोलें: "हिन्दी", "अंग्रेज़ी" या "गुजराती"',
    listeningVoice: 'भाषा की पहचान की जा रही है...',
    languages: {
      en: 'English (अंग्रेज़ी)',
      hi: 'हिन्दी (Hindi)',
      gu: 'ગુજરાતી (गुजराती)',
    },
    modes: {
      general: {
        title: 'परिदृश्य और सुरक्षा',
        desc: 'रास्ता, सीढ़ियां, दरवाजे, रुकावटें और आसपास मौजूद लोग',
        iconLabel: 'सामान्य परिदृश्य और सुरक्षा मोड',
      },
      text_ocr: {
        title: 'लिखित पाठ और दस्तावेज़',
        desc: 'दवाइयों के नाम, बोर्ड, बिल, किताबें और लेबल पढ़ें',
        iconLabel: 'पाठ पढ़ने का मोड',
      },
      currency: {
        title: 'नोट और करेंसी पहचान',
        desc: 'रुपये के नोट (₹10, ₹50, ₹100, ₹500), सिक्के और कार्ड',
        iconLabel: 'मुद्रा पहचान मोड',
      },
      objects_colors: {
        title: 'वस्तुएं और रंग पहचान',
        desc: 'सामान ढूँढें, कपड़ों के रंग और घड़ी की दिशा में स्थिति',
        iconLabel: 'वस्तु और रंग मोड',
      },
      question: {
        title: 'बोलकर सवाल पूछें',
        desc: 'कैमरे के सामने मौजूद चीज़ों के बारे में अपनी आवाज़ में सवाल पूछें',
        iconLabel: 'आवाज़ से प्रश्न मोड',
      },
    },
    camera: {
      startCamera: 'कैमरा शुरू करें',
      cameraRunning: 'कैमरा चालू है',
      flipCamera: 'कैमरा बदलें (आगे / पीछे)',
      turnOnFlash: 'टॉर्च लाइट चालू करें',
      turnOffFlash: 'टॉर्च लाइट बंद करें',
      captureSnapshot: 'अभी का दृश्य समझें (फ़ोटो लें)',
      analyzingView: 'दृश्य का विश्लेषण हो रहा है, कृपया कैमरा स्थिर रखें...',
      recordVideoClip: '3-सेकंड का वीडियो क्लिप रिकॉर्ड करें',
      recordingClip: '3 सेकंड की हलचल रिकॉर्ड हो रही है...',
      stopRecording: 'क्लिप रोकें',
      uploadFile: 'फ़ोटो या वीडियो अपलोड करें',
      continuousOn: 'लाइव ऑटो-गाइड चालू है',
      continuousOff: 'लाइव ऑटो-गाइड शुरू करें',
      continuousDesc: 'चलते समय हर 4 सेकंड में रास्ते की ताज़ा स्थिति बोलकर बताएगा',
    },
    analysis: {
      summary: 'त्वरित सारांश',
      spokenNarrative: 'विस्तृत ऑडियो विवरण',
      hazardsTitle: 'सुरक्षा चेतावनी और रुकावटें',
      noHazards: 'रास्ते में कोई सीढ़ी, गड्ढा या खतरनाक रुकावट नहीं है।',
      spatialTitle: 'वस्तुओं और लोगों की स्थिति',
      textDetectedTitle: 'पढ़ा गया लिखावट / बोर्ड',
      currencyDetectedTitle: 'पहचानी गई मुद्रा',
      suggestedActionTitle: 'चलने के लिए सुझाव',
      repeatAudio: 'ऑडियो दोबारा सुनें',
      stopAudio: 'आवाज़ रोकें',
      speakingNow: 'ऑडियो चल रहा है...',
      reAnalyze: 'फिर से जांचें',
      safetySafe: 'रास्ता सुरक्षित है',
      safetyCaution: 'सावधानी से आगे बढ़ें',
      safetyDanger: 'चेतावनी: सामने रुकावट या खतरा है',
    },
    askQuestion: {
      buttonTitle: 'आवाज़ से सवाल पूछें',
      modalTitle: 'सामने की वस्तु के बारे में कुछ भी पूछें',
      inputPlaceholder: 'जैसे: पानी की बोतल कहाँ है? इस कागज़ पर क्या लिखा है?',
      speakButton: 'बोलने के लिए यहाँ दबाएं',
      listening: 'आपकी आवाज़ सुनी जा रही है...',
      submit: 'विश्लेषण करें और उत्तर दें',
      cancel: 'रद्द करें',
    },
    settings: {
      title: 'सुगमता और आवाज़ सेटिंग्स',
      highContrast: 'हाई कॉन्ट्रास्ट डिस्प्ले',
      contrastThemes: {
        yellowBlack: 'काले बैकग्राउंड पर पीला (सर्वोत्तम)',
        whiteBlack: 'काले बैकग्राउंड पर सफेद',
        cyanBlack: 'गहरे नीले पर सियान',
        blackWhite: 'सफेद बैकग्राउंड पर काला',
      },
      textSize: 'अक्षर का आकार',
      speechSpeed: 'बोलने की गति',
      speechEngine: 'आवाज़ का प्रकार',
      neuralVoice: 'जेमिनी न्यूरल आवाज़ (प्राकृतिक और स्पष्ट)',
      browserVoice: 'डिवाइस की आवाज़ (तुरंत)',
      close: 'सहेजें और बंद करें',
    },
    keyboardShortcuts: {
      title: 'कीबोर्ड शॉर्टकट',
      space: 'SPACE: फ़ोटो लें और विश्लेषण करें',
      keys123: '1, 2, 3: भाषा बदलें (अंग्रेज़ी, हिन्दी, गुजराती)',
      keyS: 'S: आवाज़ बंद करें',
      keyR: 'R: ऑडियो दोबारा बजाएं',
      keyC: 'C: लाइव गाइड चालू / बंद करें',
      keyM: 'M: मोड बदलें',
    },
  },

  gu: {
    appTitle: 'દ્રષ્ટિ એઆઈ (Drishti AI)',
    tagline: 'અંધ અને દ્રષ્ટિહીન મિત્રો માટે કેમેરા વિઝન અને ઓડિયો માર્ગદર્શિકા',
    selectLanguageTitle: 'તમારી પસંદગીની ભાષા પસંદ કરો',
    selectLanguageDesc: 'કેમેરા વિશ્લેષણ શરૂ કરતા પહેલાં, કૃપા કરીને ઓડિયો સાંભળવા માટે તમારી ભાષા પસંદ કરો.',
    pressKeyToSelect: 'અંગ્રેજી માટે 1, હિન્દી માટે 2, ગુજરાતી માટે 3 દબાવો',
    voiceSelectHint: 'અથવા માઇક પર ટેપ કરીને બોલો: "ગુજરાતી", "હિન્દી" કે "અંગ્રેજી"',
    listeningVoice: 'તમારો અવાજ સાંભળી રહ્યા છીએ...',
    languages: {
      en: 'English (અંગ્રેજી)',
      hi: 'हिन्दी (હિન્દી)',
      gu: 'ગુજરાતી (Gujarati)',
    },
    modes: {
      general: {
        title: 'દ્રશ્ય અને સુરક્ષા',
        desc: 'ચાલવાનો રસ્તો, પગથિયાં, દરવાજા, અડચણો અને આસપાસના લોકો',
        iconLabel: 'સામાન્ય દ્રશ્ય અને સુરક્ષા મોડ',
      },
      text_ocr: {
        title: 'લખાણ અને દસ્તાવેજ',
        desc: 'દવાની બોટલો, બોર્ડ, બિલ અને દસ્તાવેજોનું લખાણ વાંચો',
        iconLabel: 'લખાણ વાંચવાનો મોડ',
      },
      currency: {
        title: 'ચલણી નોટોની ઓળખ',
        desc: 'રૂપિયાની નોટો (₹10, ₹50, ₹100, ₹500), સિક્કા અને કાર્ડ',
        iconLabel: 'ચલણ ઓળખ મોડ',
      },
      objects_colors: {
        title: 'વસ્તુઓ અને રંગો',
        desc: 'ચીજવસ્તુઓ શોધો, કપડાંના રંગ અને ઘડિયાળની દિશામાં સ્થાન',
        iconLabel: 'વસ્તુ અને રંગ ઓળખ મોડ',
      },
      question: {
        title: 'બોલીને પ્રશ્ન પૂછો',
        desc: 'કેમેરાની સામેની વસ્તુઓ વિશે તમારા અવાજમાં સીધો પ્રશ્ન પૂછો',
        iconLabel: 'અવાજથી પ્રશ્ન મોડ',
      },
    },
    camera: {
      startCamera: 'કેમેરા શરૂ કરો',
      cameraRunning: 'કેમેરા ચાલુ છે',
      flipCamera: 'કેમેરા બદલો (આગળ / પાછળ)',
      turnOnFlash: 'ટોર્ચ લાઇટ ચાલુ કરો',
      turnOffFlash: 'ટોર્ચ લાઇટ બંધ કરો',
      captureSnapshot: 'હાલનું દ્રશ્ય તપાસો (ફોટો લો)',
      analyzingView: 'દ્રશ્યનું વિશ્લેષણ થઈ રહ્યું છે, કૃપા કરીને કેમેરો સ્થિર રાખો...',
      recordVideoClip: '3-સેકન્ડનો વિડીયો ક્લિપ રેકોર્ડ કરો',
      recordingClip: '3 સેકન્ડની હલચલ રેકોર્ડ થઈ રહી છે...',
      stopRecording: 'રેકોર્ડિંગ રોકો',
      uploadFile: 'ફોટો અથવા વિડીયો અપલોડ કરો',
      continuousOn: 'લાઈવ ગાઈડ ચાલુ છે',
      continuousOff: 'લાઈવ ઓટો-ગાઈડ શરૂ કરો',
      continuousDesc: 'ચાલતી વખતે દર 4 સેકન્ડે રસ્તાની માહિતી બોલીને આપશે',
    },
    analysis: {
      summary: 'તાત્કાલિક સારાંશ',
      spokenNarrative: 'સંપૂર્ણ ઓડિયો વિગત',
      hazardsTitle: 'સુરક્ષા ચેતવણી અને અડચણો',
      noHazards: 'રસ્તામાં કોઈ જોખમી પગથિયાં કે અડચણ દેખાતી નથી.',
      spatialTitle: 'વસ્તુઓ અને લોકોનું સ્થાન',
      textDetectedTitle: 'વંચાયેલું લખાણ / બોર્ડ',
      currencyDetectedTitle: 'ઓળખાયેલી ચલણી નોટ',
      suggestedActionTitle: 'ચાલવા માટે સલાહ',
      repeatAudio: 'ઓડિયો ફરીથી સાંભળો',
      stopAudio: 'અવાજ બંધ કરો',
      speakingNow: 'અવાજ ચાલી રહ્યો છે...',
      reAnalyze: 'ફરી તપાસ કરો',
      safetySafe: 'રસ્તો સુરક્ષિત છે',
      safetyCaution: 'સાવચેતીથી આગળ વધો',
      safetyDanger: 'ચેતવણી: સામે અડચણ કે જોખમ છે',
    },
    askQuestion: {
      buttonTitle: 'અવાજથી પ્રશ્ન પૂછો',
      modalTitle: 'સામેની વસ્તુ વિશે કંઈપણ પૂછો',
      inputPlaceholder: 'ઉદાહરણ: મારી પાણીની બોટલ ક્યાં છે? આ કાગળ પર શું લખ્યું છે?',
      speakButton: 'બોલવા માટે અહીં ટેપ કરો',
      listening: 'તમારો અવાજ સાંભળી રહ્યા છીએ...',
      submit: 'વિશ્લેષણ કરો અને જવાબ આપો',
      cancel: 'રદ કરો',
    },
    settings: {
      title: 'સુગમતા અને અવાજ સેટિંગ્સ',
      highContrast: 'હાઈ કોન્ટ્રાસ્ટ ડિસ્પ્લે',
      contrastThemes: {
        yellowBlack: 'કાળા બેકગ્રાઉન્ડ પર પીળો (સૌથી શ્રેષ્ઠ)',
        whiteBlack: 'કાળા બેકગ્રાઉન્ડ પર સફેદ',
        cyanBlack: 'ઘેરા વાદળી પર સ્યાન',
        blackWhite: 'સફેદ બેકગ્રાઉન્ડ પર કાળો',
      },
      textSize: 'અક્ષરોનું કદ',
      speechSpeed: 'બોલવાની ઝડપ',
      speechEngine: 'અવાજની પદ્ધતિ',
      neuralVoice: 'જેમિની ન્યુરલ અવાજ (કુદરતી અને સ્પષ્ટ)',
      browserVoice: 'ડિવાઇસનો અવાજ (ઝડપી)',
      close: 'સાચવો અને બંધ કરો',
    },
    keyboardShortcuts: {
      title: 'કીબોર્ડ શૉર્ટકટ્સ',
      space: 'SPACE: ફોટો લો અને વિશ્લેષણ કરો',
      keys123: '1, 2, 3: ભાષા બદલો (અંગ્રેજી, હિન્દી, ગુજરાતી)',
      keyS: 'S: અવાજ બંધ કરો',
      keyR: 'R: ઓડિયો ફરી સાંભળો',
      keyC: 'C: લાઈવ ગાઈડ ચાલુ / બંધ કરો',
      keyM: 'M: મોડ બદલો',
    },
  },
};
