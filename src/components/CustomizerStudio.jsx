
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShoppingBag, Plus, Trash2, Check, RefreshCw, AlertCircle, Info, Upload, Image as ImageIcon, Camera, CheckCircle2, ChevronRight, ArrowRight, ArrowLeft, Search, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import VisualCanvas from './VisualCanvas';
import { BAG_CHARM_FRAMES, PHOTOSTRIP_LAYOUTS, SAMPLE_FRAME_PHOTOS, getFrameSlots, PARACORD_MODELS, PARACORD_LENGTHS, ACCENT_COLORS, INITIAL_CHARMS } from '../data/initialData';
import { ALL_FRAME_TEMPLATES } from './FrameLayoutSelector';
import { useBodyScrollLock } from '../utils/scrollLock';

export default function CustomizerStudio({
  products = [],
  charms = [],
  cordColors = [],
  onAddToCart,
  initialConfig = null,
  onResetPreset,
  onBackToFrames,
  currentTemplate = null,
  bundlingSession = null,
  onClearBundlingSession = null,
  onGoToFrameForBagcharm2 = null,
  studioDraft = null
}) {
  const currentProduct = products.find((p) => p.type === 'bag_charm') || products[0];

  // Bundling Session Multi-step State (For Couple / Bestie 2: 2 Bagcharms)
  const initialBundle2Step = bundlingSession?.bundle2ActiveBagcharm || studioDraft?.bundle2Step || 1;
  const initialBagcharm1 = bundlingSession?.savedBagcharm1 || studioDraft?.b1Data || null;
  const initialBagcharm2 = bundlingSession?.savedBagcharm2 || studioDraft?.b2Data || null;

  const [bundle2Step, setBundle2Step] = useState(initialBundle2Step);
  const [bagcharm1Data, setBagcharm1Data] = useState(initialBagcharm1);
  const [bagcharm2Data, setBagcharm2Data] = useState(initialBagcharm2);

  // Frame Modal Selector State
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false);
  useBodyScrollLock(isFrameModalOpen);
  const [isFrameConfirmed, setIsFrameConfirmed] = useState(true);
  const [frameSearch, setFrameSearch] = useState('');
  const [framePoseFilter, setFramePoseFilter] = useState('all');

  // Helper to get active step's initial data
  const activeInitialData = bundlingSession?.bundleType === 2
    ? (initialBundle2Step === 2 ? initialBagcharm2 : initialBagcharm1)
    : studioDraft;

  // Layout & Frame selection states (Matching Image 2)
  const [selectedLayoutId, setSelectedLayoutId] = useState(
    currentTemplate?.layoutId || activeInitialData?.layoutId || 'layout-a'
  );
  const [selectedFrameId, setSelectedFrameId] = useState(
    currentTemplate
      ? (currentTemplate.type === 'custom_frame' ? currentTemplate.frameId : null)
      : (activeInitialData?.frameId || 'frame-borcelle')
  );
  const [framePhotos, setFramePhotos] = useState(
    activeInitialData?.framePhotos || [null, null, null, null, null, null]
  );
  const [zoomMode, setZoomMode] = useState(false);

  // Bag Charm Hardware & Charm customizations
  const [selectedHwId, setSelectedHwId] = useState('');
  const [selectedColor, setSelectedColor] = useState(activeInitialData?.selectedColor || '#18181B');
  const [paracordModel, setParacordModel] = useState(activeInitialData?.paracordModel || 'twisted-loop-tassel');
  const [paracordLength, setParacordLength] = useState(activeInitialData?.paracordLength || 'long');
  const [accentColor, setAccentColor] = useState(activeInitialData?.accentColor || 'hitam');
  const starColor = accentColor;
  const bellColor = accentColor;
  const [customLetters, setCustomLetters] = useState(activeInitialData?.customLetters || '');
  const [selectedCharmIds, setSelectedCharmIds] = useState(activeInitialData?.selectedCharmIds || []);
  const [charmCategoryFilter, setCharmCategoryFilter] = useState('all');
  const [addedToast, setAddedToast] = useState(false);

  // Hidden file inputs for up to 6 photo slots
  const fileInputRef0 = useRef(null);
  const fileInputRef1 = useRef(null);
  const fileInputRef2 = useRef(null);
  const fileInputRef3 = useRef(null);
  const fileInputRef4 = useRef(null);
  const fileInputRef5 = useRef(null);
  const fileInputRefs = [fileInputRef0, fileInputRef1, fileInputRef2, fileInputRef3, fileInputRef4, fileInputRef5];


  // Synchronize bundlingSession data to prevent losing saved bagcharm
  useEffect(() => {
    if (bundlingSession?.savedBagcharm1 && !bagcharm1Data) {
      setBagcharm1Data(bundlingSession.savedBagcharm1);
    }
    if (bundlingSession?.savedBagcharm2 && !bagcharm2Data) {
      setBagcharm2Data(bundlingSession.savedBagcharm2);
    }
    if (bundlingSession?.bundle2ActiveBagcharm && bundlingSession.bundle2ActiveBagcharm !== bundle2Step) {
      setBundle2Step(bundlingSession.bundle2ActiveBagcharm);
    }
  }, [bundlingSession]);

  // Navigate to Frame Selection page (Image 2) preserving all customizations
  const handleGoToFrameSelectionPage = () => {
    const activeCustomization = {
      framePhotos: [...framePhotos],
      selectedColor,
      accentColor,
      customLetters,
      paracordModel,
      paracordLength,
      selectedCharmIds: [...selectedCharmIds]
    };

    let b1 = bagcharm1Data;
    let b2 = bagcharm2Data;

    if (bundlingSession && bundlingSession.bundleType === 2) {
      if (bundle2Step === 1) {
        b1 = {
          frameId: selectedFrameId,
          layoutId: selectedLayoutId,
          frameName: activeFrame?.name || (currentTemplate?.name || 'Bagcharm 1'),
          frameImage: activeFrame?.image || currentTemplate?.imageSrc || '/frames/1.png',
          framePhotos: [...framePhotos],
          selectedColor,
          accentColor,
          customLetters,
          paracordModel,
          paracordLength
        };
        setBagcharm1Data(b1);
        if (bundlingSession) {
          bundlingSession.savedBagcharm1 = b1;
          bundlingSession.bundle2ActiveBagcharm = 1;
        }
      } else if (bundle2Step === 2) {
        b2 = {
          frameId: selectedFrameId,
          layoutId: selectedLayoutId,
          frameName: activeFrame?.name || (currentTemplate?.name || 'Bagcharm 2'),
          frameImage: activeFrame?.image || currentTemplate?.imageSrc || '/frames/2.png',
          framePhotos: [...framePhotos],
          selectedColor,
          accentColor,
          customLetters,
          paracordModel,
          paracordLength
        };
        setBagcharm2Data(b2);
        if (bundlingSession) {
          bundlingSession.savedBagcharm2 = b2;
          bundlingSession.bundle2ActiveBagcharm = 2;
        }
      }
    }

    const draft = {
      ...activeCustomization,
      bundle2Step,
      b1Data: b1,
      b2Data: b2
    };

    if (onBackToFrames) {
      onBackToFrames(draft);
    }
  };

  // Handler to select frame inside Customizer Studio without unmounting
  const handleSelectFrameInStudio = (template) => {
    if (!template) return;
    if (template.type === 'custom_frame') {
      setSelectedFrameId(template.frameId || template.id);
      setSelectedLayoutId(template.layoutId || 'layout-a');
    } else {
      setSelectedLayoutId(template.layoutId || 'layout-a');
      setSelectedFrameId(template.frameId || null);
    }
    setIsFrameConfirmed(true);
    setIsFrameModalOpen(false);

    // Keep active bundle 2 state synced
    if (bundlingSession && bundlingSession.bundleType === 2) {
      if (bundle2Step === 1) {
        setBagcharm1Data((prev) => prev ? {
          ...prev,
          frameId: template.frameId || template.id,
          frameName: template.name,
          frameImage: template.imageSrc,
          layoutId: template.layoutId || 'layout-a'
        } : null);
        if (bundlingSession) {
          bundlingSession.selectedFrame1 = template;
        }
      } else if (bundle2Step === 2) {
        setBagcharm2Data((prev) => prev ? {
          ...prev,
          frameId: template.frameId || template.id,
          frameName: template.name,
          frameImage: template.imageSrc,
          layoutId: template.layoutId || 'layout-a'
        } : null);
        if (bundlingSession) {
          bundlingSession.selectedFrame2 = template;
        }
      }
    }
  };


  // Active Layout and Frame resolution
  const activeLayout = PHOTOSTRIP_LAYOUTS.find((l) => l.id === selectedLayoutId) || PHOTOSTRIP_LAYOUTS[0];
  const resolveFrameNum = (fId) => {
    if (!fId) return null;
    if (fId === 'frame-borcelle' || fId === 'frame-2') return '2';
    if (fId === 'frame-the-moment' || fId === 'frame-5') return '5';
    if (typeof fId === 'string' && fId.startsWith('frame-')) {
      return fId.replace('frame-', '');
    }
    return null;
  };

  const activeFrame = BAG_CHARM_FRAMES.find((f) => f.id === selectedFrameId) || (
    currentTemplate && (currentTemplate.frameId === selectedFrameId || currentTemplate.id === selectedFrameId)
      ? {
        id: selectedFrameId,
        name: currentTemplate.name,
        image: currentTemplate.imageSrc,
        overlayImage: currentTemplate.overlayImage || (resolveFrameNum(selectedFrameId) ? `/frames/${resolveFrameNum(selectedFrameId)}_overlay.png` : null),
        slots: getFrameSlots(selectedFrameId)
      }
      : (selectedFrameId && typeof selectedFrameId === 'string' && selectedFrameId.startsWith('frame-')
        ? {
          id: selectedFrameId,
          name: `Frame ${selectedFrameId.replace('frame-', '')}`,
          image: `/frames/${selectedFrameId.replace('frame-', '')}.png`,
          overlayImage: `/frames/${selectedFrameId.replace('frame-', '')}_overlay.png`,
          slots: getFrameSlots(selectedFrameId)
        }
        : null)
  );

  // Determine current active slots
  const activeSlots = activeFrame?.slots || activeLayout.slots;

  const slotCount = activeSlots.length;

  // Active hardware
  const activeHardware = currentProduct?.hardwareFinishes?.find((h) => h.id === selectedHwId) || currentProduct?.hardwareFinishes?.[0];

  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.layoutId) setSelectedLayoutId(initialConfig.layoutId);
      if (initialConfig.frameId) setSelectedFrameId(initialConfig.frameId);
      if (initialConfig.framePhotos) setFramePhotos(initialConfig.framePhotos);
      if (initialConfig.hardwareId) setSelectedHwId(initialConfig.hardwareId);
      if (initialConfig.cordColor) setSelectedColor(initialConfig.cordColor);
      if (initialConfig.paracordModel) setParacordModel(initialConfig.paracordModel);
      if (initialConfig.paracordLength) setParacordLength(initialConfig.paracordLength);
      if (initialConfig.accentColor) setAccentColor(initialConfig.accentColor);
      else if (initialConfig.starColor) setAccentColor(initialConfig.starColor);
      else if (initialConfig.bellColor) setAccentColor(initialConfig.bellColor);
      if (initialConfig.customLetters) setCustomLetters(initialConfig.customLetters);
      if (initialConfig.selectedCharms) setSelectedCharmIds(initialConfig.selectedCharms);
      if (onResetPreset) onResetPreset();
      return;
    }

    if (currentTemplate) {
      if (currentTemplate.type === 'custom_frame') {
        setSelectedFrameId(currentTemplate.frameId);
        setSelectedLayoutId(currentTemplate.layoutId || 'layout-a');
      } else {
        setSelectedFrameId(null);
        setSelectedLayoutId(currentTemplate.layoutId);
      }
    }

    if (currentProduct?.hardwareFinishes && !selectedHwId) {
      setSelectedHwId(currentProduct.hardwareFinishes[0]?.id || '');
    }
  }, [currentProduct, initialConfig, currentTemplate]);

  // Synchronize and lock settings during Bundling Session
  useEffect(() => {
    if (bundlingSession) {
      // User tidak dapat menambah charm tambahan pada paket bundling
      setSelectedCharmIds([]);
    }
    if (bundlingSession?.bundleType === 2) {
      if (bundlingSession.bundle2ActiveBagcharm === 2) {
        setBundle2Step(2);
        if (bundlingSession.savedBagcharm1) {
          setBagcharm1Data(bundlingSession.savedBagcharm1);
        }
      } else {
        setBundle2Step(1);
        setBagcharm1Data(null);
        setBagcharm2Data(null);
        if (bundlingSession.selectedFrame1) {
          setSelectedFrameId(bundlingSession.selectedFrame1.id);
          setSelectedLayoutId(bundlingSession.selectedFrame1.layoutId || 'layout-a');
        }
      }
    }
  }, [bundlingSession?.bundleId, bundlingSession?.bundle2ActiveBagcharm]);

  // Available charms list (fallback to INITIAL_CHARMS)
  const availableCharms = charms && charms.length > 0 ? charms : INITIAL_CHARMS;

  // Selected charms objects - Locked empty if in bundling session
  const selectedCharmsObjects = bundlingSession
    ? []
    : selectedCharmIds
      .map((id) => availableCharms.find((c) => c.id === id))
      .filter(Boolean);

  // Price Calculation
  const basePrice = currentProduct?.basePrice || 15000;
  const charmsPrice = selectedCharmsObjects.reduce((acc, c) => acc + (c.price || 0), 0);
  const totalPrice = basePrice + charmsPrice;
  const maxCharms = 6;
  const maxLetters = 6;

  // Toggle Charm Handler - STRICTLY DISABLED for bundling sessions
  const handleToggleCharm = (charmId) => {
    if (bundlingSession) return; // Charm tambahan dinonaktifkan untuk paket hemat bundling
    setSelectedCharmIds((prev) =>
      prev.includes(charmId)
        ? prev.filter((id) => id !== charmId)
        : [...prev, charmId]
    );
  };

  // Helper to switch between Bagcharm 1 and Bagcharm 2 for Bundle 2
  const handleSwitchBundle2Step = (targetStep) => {
    if (targetStep === bundle2Step) return;

    if (bundle2Step === 1 && targetStep === 2) {
      // 1. Snapshot current Step 1 Bagcharm 1
      const currentB1 = {
        frameId: selectedFrameId,
        layoutId: selectedLayoutId,
        frameName: activeFrame?.name || (currentTemplate?.name || 'Bagcharm 1'),
        frameImage: activeFrame?.image || currentTemplate?.imageSrc || '/frames/1.png',
        framePhotos: [...framePhotos],
        selectedColor,
        accentColor,
        customLetters,
        paracordModel,
        paracordLength
      };
      setBagcharm1Data(currentB1);
      if (bundlingSession) {
        bundlingSession.savedBagcharm1 = currentB1;
        bundlingSession.bundle2ActiveBagcharm = 2;
      }

      // 2. Load Step 2 Bagcharm 2
      const b2 = bagcharm2Data || bundlingSession?.savedBagcharm2;
      if (b2) {
        setSelectedFrameId(b2.frameId);
        setSelectedLayoutId(b2.layoutId || 'layout-a');
        setFramePhotos([...b2.framePhotos]);
        setSelectedColor(b2.selectedColor || '#18181B');
        setAccentColor(b2.accentColor || 'hitam');
        setCustomLetters(b2.customLetters || '');
        if (b2.paracordModel) setParacordModel(b2.paracordModel);
        if (b2.paracordLength) setParacordLength(b2.paracordLength);
        setIsFrameConfirmed(true);
      } else {
        const f2 = bundlingSession?.selectedFrame2;
        if (f2) {
          setSelectedFrameId(f2.id || f2.frameId);
          setSelectedLayoutId(f2.layoutId || 'layout-a');
          setIsFrameConfirmed(true);
        } else {
          setSelectedFrameId('frame-borcelle');
          setSelectedLayoutId('layout-a');
          setIsFrameConfirmed(false);
        }
        setFramePhotos([null, null, null, null, null, null]);
        setCustomLetters('');
      }
      setBundle2Step(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (bundle2Step === 2 && targetStep === 1) {
      // 1. Snapshot current Step 2 Bagcharm 2
      const currentB2 = {
        frameId: selectedFrameId,
        layoutId: selectedLayoutId,
        frameName: activeFrame?.name || (currentTemplate?.name || 'Bagcharm 2'),
        frameImage: activeFrame?.image || currentTemplate?.imageSrc || '/frames/2.png',
        framePhotos: [...framePhotos],
        selectedColor,
        accentColor,
        customLetters,
        paracordModel,
        paracordLength
      };
      setBagcharm2Data(currentB2);
      if (bundlingSession) {
        bundlingSession.savedBagcharm2 = currentB2;
        bundlingSession.bundle2ActiveBagcharm = 1;
      }

      // 2. Restore Step 1 Bagcharm 1
      const b1 = bagcharm1Data || bundlingSession?.savedBagcharm1;
      if (b1) {
        setSelectedFrameId(b1.frameId);
        setSelectedLayoutId(b1.layoutId || 'layout-a');
        setFramePhotos([...b1.framePhotos]);
        setSelectedColor(b1.selectedColor || '#18181B');
        setAccentColor(b1.accentColor || 'hitam');
        setCustomLetters(b1.customLetters || '');
        if (b1.paracordModel) setParacordModel(b1.paracordModel);
        if (b1.paracordLength) setParacordLength(b1.paracordLength);
        setIsFrameConfirmed(true);
      }
      setBundle2Step(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Move from Bagcharm 1 to Bagcharm 2 - saves Bagcharm 1 and opens frame selection for Bagcharm 2
  const handleNextToBagcharm2 = () => {
    const currentB1 = {
      frameId: selectedFrameId,
      layoutId: selectedLayoutId,
      frameName: activeFrame?.name || (currentTemplate?.name || 'Bagcharm 1'),
      frameImage: activeFrame?.image || currentTemplate?.imageSrc || '/frames/1.png',
      framePhotos: [...framePhotos],
      selectedColor,
      accentColor,
      customLetters,
      paracordModel,
      paracordLength
    };
    setBagcharm1Data(currentB1);
    if (bundlingSession) {
      bundlingSession.savedBagcharm1 = currentB1;
      bundlingSession.bundle2ActiveBagcharm = 2;
    }
    if (onGoToFrameForBagcharm2) {
      onGoToFrameForBagcharm2(currentB1);
    } else {
      handleSwitchBundle2Step(2);
    }
  };

  // Layout change handler
  const handleSelectLayout = (layoutId) => {
    setSelectedLayoutId(layoutId);
    if (layoutId === 'layout-a') {
      setSelectedFrameId('frame-the-moment');
    } else {
      setSelectedFrameId(null);
    }
  };

  // File Upload Handlers
  const handleTriggerUpload = (slotIndex) => {
    if (fileInputRefs[slotIndex]?.current) {
      fileInputRefs[slotIndex].current.click();
    }
  };

  const handleFileUpload = (slotIndex, event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setFramePhotos((prev) => {
        const next = [...prev];
        next[slotIndex] = dataUrl;
        return next;
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemovePhoto = (slotIndex) => {
    setFramePhotos((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleUseSamplePhotos = () => {
    const samples = [...SAMPLE_FRAME_PHOTOS, ...SAMPLE_FRAME_PHOTOS];
    setFramePhotos(samples.slice(0, 6));
  };

  const handleClearAllPhotos = () => {
    setFramePhotos([null, null, null, null, null, null]);
  };

  // Add to Bag action
  const handleAddToCart = () => {
    const layoutName = activeFrame?.name || (selectedFrameId === 'frame-borcelle'
      ? 'Frame 2'
      : (selectedFrameId === 'frame-the-moment' ? 'Frame 5' : (activeLayout?.name || 'Frame 1')));

    // Handle Bundling Session (Bundle 2 or Bundle 3)
    if (bundlingSession) {
      if (bundlingSession.bundleType === 2) {
        // Bundle 2 (2 Bagcharm)
        const currentActive = {
          frameId: selectedFrameId,
          frameName: activeFrame?.name || layoutName,
          frameImage: activeFrame?.image || '/frames/2.png',
          framePhotos: framePhotos.slice(0, slotCount),
          cordColorName: cordColors.find((c) => c.hex === selectedColor)?.name || 'Hitam Polos',
          customLetters: customLetters.toUpperCase().trim()
        };

        const b1 = bundle2Step === 1 ? currentActive : (bagcharm1Data || bundlingSession.savedBagcharm1 || {
          frameId: bundlingSession.selectedFrame1?.id || 'frame-1',
          frameName: bundlingSession.selectedFrame1?.name || 'Bagcharm 1',
          frameImage: bundlingSession.selectedFrame1?.imageSrc || '/frames/1.png',
          framePhotos: [],
          cordColorName: 'Hitam Polos',
          customLetters: ''
        });

        const b2 = bundle2Step === 2 ? currentActive : (bagcharm2Data || bundlingSession.savedBagcharm2 || {
          frameId: bundlingSession.selectedFrame2?.id || 'frame-borcelle',
          frameName: bundlingSession.selectedFrame2?.name || 'Bagcharm 2',
          frameImage: bundlingSession.selectedFrame2?.imageSrc || '/frames/2.png',
          framePhotos: [],
          cordColorName: 'Hitam Polos',
          customLetters: ''
        });

        const bundlePayload = {
          id: bundlingSession.bundleId || 'col-bundle-couple-2',
          productType: 'bundling',
          title: bundlingSession.bundleTitle || 'Couple / Bestie 2 (2 Bagcharm)',
          unitPrice: Number(bundlingSession.bundlePrice || 28000),
          quantity: 1,
          subtotal: Number(bundlingSession.bundlePrice || 28000),
          image: bundlingSession.bundleImage || '/images/custom_bagcharm_pink.jpg',
          bundleChoices: {
            item1: {
              label: 'Bagcharm 1',
              name: b1.frameName,
              frameId: b1.frameId,
              frameName: b1.frameName,
              image: b1.image || b1.frameImage || '/frames/1.png',
              framePhotos: b1.framePhotos || [],
              cordColorName: b1.cordColorName || 'Hitam Polos',
              customLetters: b1.customLetters || ''
            },
            item2: {
              label: 'Bagcharm 2',
              name: b2.frameName,
              frameId: b2.frameId,
              frameName: b2.frameName,
              image: b2.image || b2.frameImage || '/frames/2.png',
              framePhotos: b2.framePhotos || [],
              cordColorName: b2.cordColorName || 'Hitam Polos',
              customLetters: b2.customLetters || ''
            }
          },
          bundleDescription: `Bagcharm 1: ${b1.frameName} | Bagcharm 2: ${b2.frameName}`
        };

        onAddToCart(bundlePayload);
        if (onClearBundlingSession) onClearBundlingSession();

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#4F46E5', '#7C3AED', '#00F2FE', '#FFFFFF']
        });

        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 3500);
        return;
      }

      // Bundle 3 (1 Gelang & 1 Bagcharm)
      const bundlePayload = {
        id: bundlingSession.bundleId || 'col-bundle-couple-3',
        productType: 'bundling',
        title: bundlingSession.bundleTitle || 'Couple / Bestie 3 (1 Gelang & 1 Bagcharm)',
        unitPrice: Number(bundlingSession.bundlePrice || 27000),
        quantity: 1,
        subtotal: Number(bundlingSession.bundlePrice || 27000),
        image: bundlingSession.bundleImage || '/images/custom_bagcharm_blue.jpg',
        bundleChoices: {
          item1: {
            label: 'Gelang',
            name: bundlingSession.selectedGelang?.name || 'Gelang Pilihan',
            image: bundlingSession.selectedGelang?.image || '/images/bracelet_pearl_star.jpg',
            id: bundlingSession.selectedGelang?.id || 'gelang-1'
          },
          item2: {
            label: 'Custom Bagcharm',
            name: layoutName,
            frameId: selectedFrameId,
            frameName: layoutName,
            image: activeFrame?.image || '/frames/2.png',
            framePhotos: framePhotos.slice(0, slotCount),
            cordColorName: cordColors.find((c) => c.hex === selectedColor)?.name || 'Hitam Polos',
            customLetters: customLetters.toUpperCase().trim()
          }
        },
        bundleDescription: `Gelang: ${bundlingSession.selectedGelang?.name || 'Gelang'} | Bagcharm: ${layoutName}`
      };

      onAddToCart(bundlePayload);
      if (onClearBundlingSession) onClearBundlingSession();

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#4F46E5', '#7C3AED', '#00F2FE', '#FFFFFF']
      });

      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 3500);
      return;
    }

    const itemPayload = {
      productType: 'bag_charm',
      title: `Custom Photostrip Bag Charm — ${layoutName}`,
      baseName: `${layoutName} (${slotCount} Pose)`,
      baseId: selectedFrameId || selectedLayoutId,
      layoutId: selectedLayoutId,
      frameId: selectedFrameId,
      frameName: layoutName,
      frameImage: activeFrame ? activeFrame.image : null,
      framePhotos: framePhotos.slice(0, slotCount),
      hardwareName: activeHardware?.name || 'Liquid Chrome Silver',
      hardwareId: activeHardware?.id || 'hw-chrome-silver',
      hardwareColor: activeHardware?.color || '#DCE2E6',
      cordColor: selectedColor,
      cordColorName: cordColors.find((c) => c.hex === selectedColor)?.name || 'Hitam Polos',
      paracordModel: paracordModel,
      paracordModelName: 'Twisted Loop & Dual Tassel',
      paracordLength: paracordLength,
      paracordLengthName: 'Long Dangle - Setinggi Slot 3',
      accentColor: accentColor,
      accentColorName: ACCENT_COLORS.find((c) => c.id === accentColor)?.name || 'Hitam',
      starColor: accentColor,
      starColorName: ACCENT_COLORS.find((c) => c.id === accentColor)?.name || 'Hitam',
      bellColor: accentColor,
      bellColorName: ACCENT_COLORS.find((c) => c.id === accentColor)?.name || 'Hitam',
      customLetters: customLetters.toUpperCase().trim(),
      charms: selectedCharmsObjects,
      unitPrice: totalPrice,
      quantity: 1,
      subtotal: totalPrice
    };

    onAddToCart(itemPayload);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#F43F5E', '#00F2FE', '#A3E635', '#FFFFFF']
    });

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3500);
  };

  return (
    <section className="customizer-section" id="studio-customizer">
      <div className="container">
        {/* Top Header & Breadcrumb Bar with Back Button */}
        <div className="studio-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleGoToFrameSelectionPage}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '6px 13px',
                borderRadius: 'var(--radius-full)',
                flexShrink: 0
              }}
            >
              ← Pilihan Frame
            </button>

            <span className="badge badge-cyan" style={{ fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
              {activeFrame ? activeFrame.name : activeLayout.name} ({slotCount} Foto)
            </span>
          </div>
        </div>

        {/* Active Bundling Notice Banner */}
        {bundlingSession && (
          <div
            style={{
              background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
              border: '1.5px solid #818CF8',
              borderRadius: '16px',
              padding: '12px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.08)'
            }}
          >
            {bundlingSession.bundleType === 2 ? (
              /* BUNDLE 2 (2 BAGCHARM) BANNER */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                <span
                  style={{
                    background: '#4F46E5',
                    color: '#FFF',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '4px 14px',
                    borderRadius: '999px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  Paket Bundling 2
                </span>

                {onClearBundlingSession && (
                  <button
                    type="button"
                    onClick={onClearBundlingSession}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.78rem',
                      padding: '5px 14px',
                      borderRadius: '999px',
                      color: '#DC2626',
                      borderColor: '#FCA5A5'
                    }}
                  >
                    Batal Bundling
                  </button>
                )}
              </div>
            ) : (
              /* BUNDLE 3 (1 GELANG & 1 BAGCHARM) BANNER */
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {bundlingSession.selectedGelang?.image && (
                    <img
                      src={bundlingSession.selectedGelang.image}
                      alt={bundlingSession.selectedGelang.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '2px solid #6366F1'
                      }}
                    />
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#4F46E5',
                          color: '#FFF',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          textTransform: 'uppercase'
                        }}
                      >
                        Paket Bundling 3
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#312E81' }}>
                        Rp {Number(bundlingSession.bundlePrice || 27000).toLocaleString('id-ID')} (Hemat Paket)
                      </span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: '#4338CA', marginTop: '3px' }}>
                      Gelang: <strong>{bundlingSession.selectedGelang?.name || 'Gelang Pilihan'}</strong> (Terpilih) • Sekarang kustom Bagcharm pasangan Anda!
                    </div>
                  </div>
                </div>

                {onClearBundlingSession && (
                  <button
                    type="button"
                    onClick={onClearBundlingSession}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: '0.78rem',
                      padding: '5px 14px',
                      borderRadius: '999px',
                      color: '#DC2626',
                      borderColor: '#FCA5A5'
                    }}
                  >
                    Batal Bundling
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Studio Grid: Canvas Preview (Left) + Customization Engine (Right) */}
        <div className="studio-grid">
          {/* LEFT: Real-Time Preview (Matching Image 2 Reference) */}
          <div className="tt-preview-column">
            {/* Step Switcher Tabs Centered Above REAL-TIME PREVIEW */}
            {bundlingSession && bundlingSession.bundleType === 2 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    background: '#EEF2FF',
                    padding: '4px',
                    borderRadius: '14px',
                    border: '1.5px solid #C7D2FE',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.1)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleSwitchBundle2Step(1)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: bundle2Step === 1 ? '#4F46E5' : 'transparent',
                      color: bundle2Step === 1 ? '#FFFFFF' : '#4338CA',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>1. Bagcharm 1</span>
                    {bagcharm1Data && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: bundle2Step === 1 ? 'rgba(255,255,255,0.3)' : '#10B981',
                          color: '#FFFFFF',
                          padding: '1px 6px',
                          borderRadius: '999px',
                          fontWeight: 800
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchBundle2Step(2)}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '10px',
                      border: 'none',
                      background: bundle2Step === 2 ? '#4F46E5' : 'transparent',
                      color: bundle2Step === 2 ? '#FFFFFF' : '#4338CA',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>2. Bagcharm 2</span>
                    {bagcharm2Data && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          background: bundle2Step === 2 ? 'rgba(255,255,255,0.3)' : '#10B981',
                          color: '#FFFFFF',
                          padding: '1px 6px',
                          borderRadius: '999px',
                          fontWeight: 800
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="tt-preview-label" style={{ textAlign: 'center' }}>REAL-TIME PREVIEW</div>

            <div className="tt-preview-card">
              <div className="tt-preview-card-header">
                <div className="tt-preview-badge">
                  <span className="tt-preview-pulse-dot" />
                  <span>Interactive 2D Charm</span>
                </div>
                <button
                  type="button"
                  className="tt-preview-reset-btn"
                  onClick={() => {
                    setSelectedCharmIds([]);
                    setCustomLetters('');
                    handleClearAllPhotos();
                  }}
                  title="Reset Kustomisasi"
                >
                  <RefreshCw size={12} />
                  <span>Reset</span>
                </button>
              </div>

              {/* SVG Visualizer with Widened Frame & Photo Slots */}
              <VisualCanvas
                productType="bag_charm"
                baseModel={currentProduct?.bases?.[0]}
                cordColor={selectedColor}
                paracordModel={paracordModel}
                paracordLength={paracordLength}
                starColor={starColor}
                bellColor={bellColor}
                hardware={activeHardware}
                customLetters={customLetters}
                selectedCharms={selectedCharmsObjects}
                selectedFrame={activeFrame}
                selectedLayoutId={selectedLayoutId}
                framePhotos={framePhotos}
                onSlotClick={(slotIdx) => handleTriggerUpload(slotIdx)}
                zoomMode={zoomMode}
                onToggleZoom={(val) => setZoomMode(val)}
                onChangeFrame={handleGoToFrameSelectionPage}
                isFrameConfirmed={isFrameConfirmed}
              />

              {/* Frame Specs Pill */}
              <div className="tt-preview-card-footer">
                <div>
                  <div className="tt-preview-footer-sub">FRAME & AKSEN TERPILIH</div>
                  <div className="tt-preview-footer-title">
                    {activeFrame ? `${activeFrame.name} (${slotCount} Slot)` : `${activeLayout.name} (${activeLayout.poseText})`}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 600, marginTop: '2px' }}>
                    Tali: Twisted Loop & Dual Tassel • Aksen (Bintang & Lonceng): {ACCENT_COLORS.find(c => c.id === accentColor)?.name || 'Hitam'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tt-preview-footer-sub">ESTIMASI RAKIT</div>
                  <span className="tt-preview-footer-eta">1-2 Hari Kerja</span>
                </div>
              </div>
            </div>

            {/* Hint Matching Image 2 Reference */}
            <div className="tt-preview-hint">
              <span className="tt-preview-hint-sparkle">✨</span>
              <span>Customize on the right to see live preview updates</span>
            </div>
          </div>

          {/* RIGHT: Step-by-Step Customizer Panel */}
          <div className="config-panel">
            {/* Step navigation bar */}
            <div className="tt-steps-bar">
              <span className="tt-step-pill-btn completed">1: Foto Slot</span>
              <span className="tt-step-pill-btn completed">2: Tali & Aksen</span>
              <span className="tt-step-pill-btn active">3: Charm Tambahan</span>
            </div>

            {/* Step 1: Upload Foto ke Slot Frame */}
            <div className="config-step">
              <div className="config-step-header" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="step-num">1</span>
                  <div>
                    <h3 className="config-step-title">Upload Foto ke Slot Layout</h3>
                    <p className="config-step-subtitle">
                      Pilihan: <strong>{selectedFrameId ? activeFrame?.name : activeLayout.name}</strong> ({slotCount} Slot Foto)
                    </p>
                  </div>
                </div>
                <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                  {framePhotos.slice(0, slotCount).filter(Boolean).length} / {slotCount} Terpasang
                </span>
              </div>

              {/* Hidden File Inputs for Each Slot */}
              {[0, 1, 2, 3, 4, 5].map((idx) => (
                <input
                  key={idx}
                  type="file"
                  ref={fileInputRefs[idx]}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={(e) => handleFileUpload(idx, e)}
                />
              ))}

              {/* Dynamic Compact Photo Slot Cards based on slotCount */}
              <div className="photo-slots-grid">
                {activeSlots.map((slot, idx) => {
                  const hasPhoto = Boolean(framePhotos[idx]);
                  const isOval = selectedFrameId === 'frame-borcelle';

                  return (
                    <div key={idx} className="photo-slot-card">
                      <div
                        className={`photo-slot-preview-box ${hasPhoto ? 'has-photo' : ''} ${isOval ? 'is-oval' : ''}`}
                        onClick={() => handleTriggerUpload(idx)}
                        title="Klik untuk memilih foto"
                      >
                        {hasPhoto ? (
                          <img src={framePhotos[idx]} alt={slot.label || `Foto ${idx + 1}`} />
                        ) : (
                          <Camera size={16} color="var(--text-muted)" />
                        )}
                      </div>

                      <div className="photo-slot-info">
                        <div className="photo-slot-label">{slot.label || `Foto ${idx + 1}`}</div>
                        <div className="photo-slot-status">
                          {hasPhoto ? (
                            <span style={{ color: 'var(--accent-lime)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={11} /> Terpasang
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>Belum ada</span>
                          )}
                        </div>
                      </div>

                      <div className="photo-slot-actions">
                        <button
                          type="button"
                          className="upload-file-btn"
                          onClick={() => handleTriggerUpload(idx)}
                        >
                          <Upload size={11} />
                          <span>{hasPhoto ? 'Ganti' : 'Pilih'}</span>
                        </button>

                        {hasPhoto && (
                          <button
                            type="button"
                            className="remove-photo-btn"
                            onClick={() => handleRemovePhoto(idx)}
                            title="Hapus foto ini"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sample Photos helper */}
              <div className="sample-photos-row">
                <span style={{ color: 'var(--text-secondary)' }}>Ingin coba preview cepat?</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={handleUseSamplePhotos}
                  >
                    <Sparkles size={13} /> Pakai Foto Contoh
                  </button>
                  {framePhotos.some(Boolean) && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={handleClearAllPhotos}
                      style={{ color: 'var(--accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                    >
                      Reset Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Kustomisasi Tali Paracord & Aksen (Lonceng & Bintang) */}
            <div className="config-step">
              <div className="config-step-header">
                <span className="step-num">2</span>
                <div>
                  <h3 className="config-step-title">Kustomisasi Tali Paracord & Aksen</h3>
                  <p className="config-step-subtitle">
                    Model: <strong>Twisted Loop & Dual Tassel</strong> • Panjang: <strong>Long Dangle (Setinggi Slot 3)</strong>
                  </p>
                </div>
              </div>

              {/* Sub-step 2A: Pilihan Warna Tali Paracord */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  1. Warna Tali Paracord (Polos & Bintik)
                </label>
                <div className="swatch-group">
                  {cordColors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`color-swatch-btn ${selectedColor === c.hex ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(c.hex)}
                    >
                      <span
                        className="color-circle"
                        style={{
                          background: c.hex,
                          border: c.hex === '#FFFFFF' ? '1.5px solid #CBD5E1' : 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <span>{c.name}</span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontSize: '0.68rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: c.type === 'polos' ? '#F3F4F6' : '#EFF6FF',
                          color: c.type === 'polos' ? '#4B5563' : '#2563EB',
                          fontWeight: 600
                        }}
                      >
                        {c.badge || (c.type === 'polos' ? 'Polos' : 'Bintik')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sub-step 2B: Pilihan Warna Aksen (Bintang & Lonceng Jadi Satu Warna) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    2. Pilihan Warna Aksen (Bintang Akrilik & Lonceng)
                  </label>
                  <span style={{ fontSize: '0.74rem', color: '#4F46E5', fontWeight: 600 }}>
                    {ACCENT_COLORS.find((c) => c.id === accentColor)?.name || 'Hitam'}
                  </span>
                </div>
                <div className="accent-color-grid">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={`accent-${c.id}`}
                      type="button"
                      className="accent-color-btn"
                      onClick={() => setAccentColor(c.id)}
                      style={{
                        border: accentColor === c.id ? '2px solid #4F46E5' : '1px solid var(--border-subtle)',
                        background: accentColor === c.id ? 'rgba(79, 70, 229, 0.06)' : '#FFFFFF'
                      }}
                    >
                      <span
                        style={{
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          background: c.hex,
                          border: `1.5px solid ${c.border || '#CBD5E1'}`,
                          display: 'inline-block',
                          flexShrink: 0,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {c.name}
                      </span>
                      {accentColor === c.id && <Check size={14} color="#4F46E5" style={{ marginLeft: 'auto' }} />}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.35 }}>
                  *Warna bintang akrilik dan lonceng mini otomatis serasi (satu warna).
                </p>
              </div>
            </div>

            {/* Step 3: Pilihan Charm Tambahan */}
            <div className="config-step">
              <div className="config-step-header">
                <span className="step-num">3</span>
                <div>
                  <h3 className="config-step-title">Charm Tambahan (Opsional)</h3>
                  <p className="config-step-subtitle">
                    {bundlingSession
                      ? 'Paket hemat bundling sudah termasuk aksen charm matching gratis'
                      : 'Pilih liontin tambahan untuk mempercantik bag charm Anda (+Rp 5.000/charm)'}
                  </p>
                </div>
              </div>

              {bundlingSession ? (
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    background: '#F9FAFB',
                    border: '1.5px dashed #C7D2FE',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#EEF2FF',
                      color: '#4F46E5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '1.1rem'
                    }}
                  >
                    ✨
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937' }}>
                      Charm Tambahan Dinonaktifkan untuk Paket Bundling
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '3px', lineHeight: 1.45 }}>
                      Setiap paket hemat bundling sudah dilengkapi <strong>aksesoris lengkap & aksen charm matching (Bintang Akrilik & Lonceng Mini)</strong> tanpa biaya ekstra. Charm satuan tambahan tidak dapat ditambahkan pada paket bundling.
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    {availableCharms.map((ch) => {
                      const isSelected = selectedCharmIds.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          className={`charm-select-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleToggleCharm(ch.id)}
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #4F46E5' : '1px solid var(--border-subtle)',
                            background: isSelected ? 'rgba(79, 70, 229, 0.05)' : '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textAlign: 'left',
                            transition: 'all 0.2s ease',
                            boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.1)' : 'none'
                          }}
                        >
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: isSelected ? 'rgba(79, 70, 229, 0.1)' : '#F3F4F6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                              flexShrink: 0,
                              border: isSelected ? '1.5px solid #4F46E5' : '1px solid rgba(0, 0, 0, 0.08)'
                            }}
                          >
                            {ch.image ? (
                              <img
                                src={ch.image}
                                alt={ch.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: '1.5rem' }}>{ch.icon || '⭐'}</span>
                            )}
                          </div>
                          <div style={{ flexGrow: 1 }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                              {ch.name}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                              {ch.description || ch.desc}
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#4F46E5' }}>
                              +Rp {Number(ch.price).toLocaleString('id-ID')}
                            </div>
                          </div>
                          <div
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '6px',
                              border: isSelected ? 'none' : '1.5px solid #CBD5E1',
                              background: isSelected ? '#4F46E5' : '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {isSelected && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCharmIds.length === 0 ? (
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.35 }}>
                      *Tidak memilih charm tambahan? Biarkan kosong (tanpa biaya ekstra).
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.74rem', color: '#4F46E5', fontWeight: 600, marginTop: '10px', lineHeight: 1.35 }}>
                      ✓ {selectedCharmIds.length} charm tambahan dipilih (+Rp {(selectedCharmsObjects.reduce((acc, c) => acc + (c.price || 0), 0)).toLocaleString('id-ID')}).
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Price & Add to Bag Sticky Bar */}
            <div className="tt-price-card">
              {bundlingSession ? (
                bundlingSession.bundleType === 2 ? (
                  <>
                    <div className="price-row">
                      <span style={{ fontWeight: 700, color: '#4F46E5' }}>{bundlingSession.bundleTitle || 'Paket Couple / Bestie 2'}</span>
                      <span style={{ fontWeight: 800 }}>Rp 28.000</span>
                    </div>
                    <div className="price-row" style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                      <span>• Bagcharm 1: {bundle2Step === 1 ? (activeFrame?.name || 'Sedang diedit') : (bagcharm1Data?.frameName || bundlingSession.selectedFrame1?.name || 'Selesai')}</span>
                      <span style={{ color: bundle2Step === 1 ? '#4F46E5' : '#10B981', fontWeight: 700 }}>
                        {bundle2Step === 1 ? 'Sedang Kustom' : '✓ Siap'}
                      </span>
                    </div>
                    <div className="price-row" style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                      <span>• Bagcharm 2: {bundle2Step === 2 ? (activeFrame?.name || 'Sedang diedit') : (bagcharm2Data?.frameName || bundlingSession.selectedFrame2?.name || 'Langkah Berikutnya')}</span>
                      <span style={{ color: bundle2Step === 2 ? '#4F46E5' : '#9CA3AF', fontWeight: 700 }}>
                        {bundle2Step === 2 ? 'Sedang Kustom' : 'Menunggu'}
                      </span>
                    </div>
                    <div className="price-total-row">
                      <span className="price-total-label">Total Paket Bundling (2 Bagcharm)</span>
                      <span className="price-total-amount">Rp 28.000</span>
                    </div>

                    {bundle2Step === 1 ? (
                      <button
                        type="button"
                        className="tt-add-to-cart-btn"
                        onClick={handleNextToBagcharm2}
                        style={{
                          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                          color: '#FFFFFF',
                          boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        <span>Lanjut ke Bagcharm 2 (Pilih Frame)</span>
                        <ArrowRight size={18} />
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={() => handleSwitchBundle2Step(1)}
                          style={{ flex: 1, borderRadius: '12px', fontSize: '0.82rem', padding: '10px' }}
                        >
                          ← Ubah Bagcharm 1
                        </button>
                        <button
                          type="button"
                          className="tt-add-to-cart-btn"
                          onClick={handleAddToCart}
                          style={{
                            flex: 2,
                            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                            color: '#FFFFFF',
                            boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                          }}
                        >
                          <ShoppingBag size={18} />
                          <span>Masukkan Keranjang</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="price-row">
                      <span style={{ fontWeight: 700, color: '#4F46E5' }}>{bundlingSession.bundleTitle || 'Paket Couple / Bestie 3'}</span>
                      <span style={{ fontWeight: 800 }}>Rp {Number(bundlingSession.bundlePrice || 27000).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="price-row" style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                      <span>• 1x Gelang: {bundlingSession.selectedGelang?.name || 'Gelang Pilihan'}</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>Termasuk</span>
                    </div>
                    <div className="price-row" style={{ fontSize: '0.8rem', color: '#4B5563' }}>
                      <span>• 1x Custom Bagcharm: {activeFrame ? activeFrame.name : activeLayout.name}</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>Termasuk</span>
                    </div>
                    <div className="price-total-row">
                      <span className="price-total-label">Total Paket Bundling</span>
                      <span className="price-total-amount">Rp {Number(bundlingSession.bundlePrice || 27000).toLocaleString('id-ID')}</span>
                    </div>

                    <button
                      type="button"
                      className="tt-add-to-cart-btn"
                      onClick={handleAddToCart}
                      style={{
                        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                        color: '#FFFFFF',
                        boxShadow: '0 6px 18px rgba(79, 70, 229, 0.35)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <ShoppingBag size={18} />
                      <span>Masukkan Keranjang</span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <div className="price-row">
                    <span>Custom Photostrip Bag Charm</span>
                    <span>Rp {basePrice.toLocaleString('id-ID')}</span>
                  </div>
                  {selectedCharmsObjects.map((ch) => (
                    <div key={ch.id} className="price-row" style={{ fontSize: '0.82rem', color: '#4F46E5', fontWeight: 600 }}>
                      <span>+ Charm: {ch.name}</span>
                      <span>+Rp {Number(ch.price).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="price-total-row">
                    <span className="price-total-label">Total Harga</span>
                    <span className="price-total-amount">Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>

                  <button
                    type="button"
                    className="tt-add-to-cart-btn"
                    onClick={handleAddToCart}
                  >
                    <ShoppingBag size={18} />
                    <span>Masukkan Keranjang</span>
                  </button>
                </>
              )}

              {addedToast && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    justifyContent: 'center'
                  }}
                >
                  <Check size={14} /> Berhasil dimasukkan ke keranjang belanja!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* IN-STUDIO FRAME SELECTOR MODAL */}
      {isFrameModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFrameModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              overflow: 'hidden'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#4F46E5" />
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                    Pilih Desain Frame Photostrip
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748B' }}>
                  Ganti frame kapan saja tanpa khawatir — foto dan aksen kustom yang sudah dipasang tetap tersimpan!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFrameModalOpen(false)}
                style={{
                  background: '#EDF2F7',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                  transition: 'background 0.2s'
                }}
                aria-label="Tutup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div
              style={{
                padding: '14px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap',
                background: '#FFFFFF'
              }}
            >
              {/* Search input */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#F1F5F9',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  flex: 1,
                  minWidth: '200px'
                }}
              >
                <Search size={16} color="#94A3B8" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Cari nama frame atau tema..."
                  value={frameSearch}
                  onChange={(e) => setFrameSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.84rem',
                    width: '100%',
                    color: '#0F172A'
                  }}
                />
                {frameSearch && (
                  <button
                    type="button"
                    onClick={() => setFrameSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} color="#94A3B8" />
                  </button>
                )}
              </div>

              {/* Pose filter pills */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {[
                  { id: 'all', label: 'Semua (30)' },
                  { id: '2', label: '2 Pose' },
                  { id: '3', label: '3 Pose' },
                  { id: '4', label: '4 Pose' }
                ].map((flt) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => setFramePoseFilter(flt.id)}
                    style={{
                      background: framePoseFilter === flt.id ? '#4F46E5' : '#F1F5F9',
                      color: framePoseFilter === flt.id ? '#FFFFFF' : '#475569',
                      border: 'none',
                      borderRadius: '999px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body: Frame Grid */}
            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
              }}
            >
              {ALL_FRAME_TEMPLATES
                .filter((tmpl) => {
                  const q = frameSearch.toLowerCase().trim();
                  if (q) {
                    const match =
                      tmpl.name.toLowerCase().includes(q) ||
                      (tmpl.subtitle && tmpl.subtitle.toLowerCase().includes(q)) ||
                      (tmpl.description && tmpl.description.toLowerCase().includes(q));
                    if (!match) return false;
                  }
                  if (framePoseFilter === '2') {
                    return tmpl.subtitle?.includes('2 Pose') || tmpl.badge?.includes('2-Pose');
                  }
                  if (framePoseFilter === '3') {
                    return tmpl.subtitle?.includes('3 Pose') || tmpl.badge?.includes('3-Pose');
                  }
                  if (framePoseFilter === '4') {
                    return tmpl.subtitle?.includes('4 Pose') || tmpl.badge?.includes('4-Pose');
                  }
                  return true;
                })
                .map((tmpl) => {
                  const isCurrent =
                    selectedFrameId === tmpl.frameId ||
                    selectedFrameId === tmpl.id ||
                    (selectedFrameId === 'frame-borcelle' && tmpl.id === 'frame-borcelle') ||
                    (selectedFrameId === 'frame-the-moment' && tmpl.id === 'frame-5');

                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectFrameInStudio(tmpl)}
                      style={{
                        border: isCurrent ? '2.5px solid #10B981' : '1.5px solid #E2E8F0',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        background: isCurrent ? '#F0FDF4' : '#FFFFFF',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        boxShadow: isCurrent
                          ? '0 6px 16px rgba(16, 185, 129, 0.2)'
                          : '0 2px 6px rgba(0,0,0,0.04)'
                      }}
                    >
                      {/* Frame image preview */}
                      <div
                        style={{
                          height: '220px',
                          background: '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          position: 'relative'
                        }}
                      >
                        <img
                          src={tmpl.imageSrc}
                          alt={tmpl.name}
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            borderRadius: '6px'
                          }}
                          loading="lazy"
                        />
                        {isCurrent && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#10B981',
                              color: '#FFFFFF',
                              borderRadius: '999px',
                              padding: '3px 8px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
                            }}
                          >
                            <Check size={12} strokeWidth={3} /> Terpilih
                          </div>
                        )}
                      </div>

                      {/* Card Info */}
                      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              background: '#EEF2FF',
                              color: '#4F46E5',
                              padding: '2px 8px',
                              borderRadius: '999px'
                            }}
                          >
                            {tmpl.badge || (tmpl.subtitle?.includes('2 Pose') ? '2 Pose' : (tmpl.subtitle?.includes('4 Pose') ? '4 Pose' : '3 Pose'))}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            color: '#0F172A',
                            lineHeight: 1.3,
                            marginBottom: '4px'
                          }}
                        >
                          {tmpl.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: 'auto', paddingTop: '8px' }}>
                          {tmpl.subtitle || 'Photostrip Bag Charm'}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFrameInStudio(tmpl);
                          }}
                          style={{
                            marginTop: '10px',
                            width: '100%',
                            background: isCurrent ? '#10B981' : '#4F46E5',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '7px 10px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          {isCurrent ? (
                            <>
                              <Check size={14} /> Frame Aktif
                            </>
                          ) : (
                            'Pilih Frame Ini'
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #E2E8F0',
                background: '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Total 30 Desain Photostrip Tersedia
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsFrameModalOpen(false)}
                style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '0.82rem' }}
              >
                Selesai / Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
