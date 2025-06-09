import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Chip,
  Divider,
  Alert,
  Paper,
  IconButton
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import { useLearningTargetsStore } from '../../store/useLearningTargetsStore';
import { ProposedTopic } from '../../types/learning-target.types';
import learningTargetService from '../../services/learningTarget.service';
import { toast } from 'react-hot-toast';

interface ProposeLearningTopicsProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
}

// Function to get AI topic suggestions from backend
const getAiTopicSuggestions = async (courseId: string, context: string, existingTopics: string[]): Promise<ProposedTopic[]> => {
  try {
    console.log('🤖 Calling backend AI service for topic suggestions...');
    
    // Call the backend API using the new standardized endpoint
    const response = await learningTargetService.proposeNewTopics({
      courseId,
      contextText: context,
      existingTopicTexts: existingTopics
    });
    
    console.log('✅ Backend AI service response:', response);
    return response.proposedTopics;
  } catch (error) {
    console.error('❌ Backend AI service error:', error);
    throw new Error('AI konu önerileri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

// Function to confirm topics and create learning targets via API
const confirmTopics = async (courseId: string, selectedTopics: ProposedTopic[]): Promise<void> => {
  try {
    console.log('Confirming topics via real backend API:', { courseId, selectedTopics });
    
    // Call the new backend API using confirmProposedTopics
    const result = await learningTargetService.confirmProposedTopics(courseId, selectedTopics);
    
    toast.success(`${result.length} öğrenme hedefi başarıyla oluşturuldu!`);
  } catch (error) {
    console.error('Error confirming topics:', error);
    toast.error('Öğrenme hedefleri oluşturulurken bir hata oluştu.');
    throw error;
  }
};

const ProposeLearningTopics: React.FC<ProposeLearningTopicsProps> = ({
  open,
  onClose,
  courseId
}) => {
  // Context text that will be analyzed by AI
  const [contextText, setContextText] = useState('');
  
  // Track UI state
  const [isLoading, setIsLoading] = useState(false);
  const [proposedTopics, setProposedTopics] = useState<ProposedTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<ProposedTopic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [step, setStep] = useState<'input' | 'review' | 'success'>('input');
  
  // Get existing topics for the course
  const { targets, fetchTargets } = useLearningTargetsStore();
  const existingTopics = targets
    .filter(target => target.courseId === courseId)
    .map(target => target.topicName);

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('📝 [ProposeLearningTopics] Context text değiştiriliyor:', {
      previousLength: contextText.length,
      newLength: newValue.length,
      lengthDifference: newValue.length - contextText.length,
      isEmpty: !newValue.trim(),
      timestamp: new Date().toISOString()
    });
    
    setContextText(newValue);
  };

  const handlePropose = async () => {
    console.group('🤖 [ProposeLearningTopics] handlePropose - AI konu önerisi başlatılıyor');
    console.log('📋 Parametreler:', {
      contextTextLength: contextText.length,
      contextTextPreview: contextText.substring(0, 200) + '...',
      existingTopicsCount: existingTopics.length,
      existingTopics: existingTopics.slice(0, 5),
      courseId,
      timestamp: new Date().toISOString()
    });

    if (!contextText.trim()) {
      console.warn('⚠️ Boş context text!');
      setError('Lütfen analiz edilecek bir metin girin.');
      console.groupEnd();
      return;
    }
    
    console.log('🔄 AI önerisi işlemi başlatılıyor...');
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🌐 Mock AI service çağrısı yapılıyor...', {
        contextLength: contextText.length,
        existingTopicsCount: existingTopics.length,
        service: 'mockAiSuggestTopics'
      });

      // Call the real backend API for AI topic suggestions
      const startTime = performance.now();
      const topics = await getAiTopicSuggestions(courseId, contextText, existingTopics);
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ AI önerileri başarıyla alındı:', {
        proposedTopicsCount: topics.length,
        proposedTopics: topics,
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        relevanceDistribution: topics.reduce((acc, topic) => {
          const relevance = topic.relevance || 'Bilinmeyen';
          acc[relevance] = (acc[relevance] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        timestamp: new Date().toISOString()
      });

      setProposedTopics(topics);
      setSelectedTopics([]); // Reset selection
      console.log('📊 State güncellendi:', {
        proposedTopicsCount: topics.length,
        selectedTopicsCount: 0,
        nextStep: 'review'
      });
      setStep('review');
      
      console.log('🎉 handlePropose başarıyla tamamlandı!');
    } catch (error) {
      console.error('❌ AI önerisi HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        contextLength: contextText.length,
        existingTopicsCount: existingTopics.length,
        timestamp: new Date().toISOString()
      });

      console.error('Error proposing topics:', error);
      setError('Konu önerileri alınırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      console.log('🏁 Loading durumu false yapılıyor...');
      setIsLoading(false);
      console.log('💥 handlePropose işlemi sonlandı');
      console.groupEnd();
    }
  };

  const handleTopicToggle = (topic: ProposedTopic) => {
    console.group('🔄 [ProposeLearningTopics] handleTopicToggle - Konu seçimi değiştiriliyor');
    console.log('📋 Parametreler:', {
      topicId: topic.tempId,
      topicName: topic.name,
      topicRelevance: topic.relevance,
      currentSelectedCount: selectedTopics.length,
      isCurrentlySelected: selectedTopics.some(t => t.tempId === topic.tempId),
      timestamp: new Date().toISOString()
    });

    const currentIndex = selectedTopics.findIndex(t => t.tempId === topic.tempId);
    const newSelectedTopics = [...selectedTopics];
    
    let action: string;
    if (currentIndex === -1) {
      newSelectedTopics.push(topic);
      action = 'Eklendi';
    } else {
      newSelectedTopics.splice(currentIndex, 1);
      action = 'Kaldırıldı';
    }
    
    console.log('✅ Konu seçimi güncellendi:', {
      action,
      topicName: topic.name,
      newSelectedCount: newSelectedTopics.length,
      selectedTopicNames: newSelectedTopics.map(t => t.name),
      totalProposedTopics: proposedTopics.length
    });
    
    setSelectedTopics(newSelectedTopics);
    console.groupEnd();
  };

  const handleConfirm = async () => {
    console.group('✅ [ProposeLearningTopics] handleConfirm - Seçili konular onaylanıyor');
    console.log('📋 Onay bilgileri:', {
      selectedTopicsCount: selectedTopics.length,
      selectedTopicNames: selectedTopics.map(t => t.name),
      selectedTopicsDetails: selectedTopics,
      courseId,
      totalProposedTopics: proposedTopics.length,
      timestamp: new Date().toISOString()
    });

    if (selectedTopics.length === 0) {
      console.warn('⚠️ Hiç konu seçilmemiş!');
      setError('Lütfen en az bir konu seçin.');
      console.groupEnd();
      return;
    }
    
    console.log('🔄 Konular kaydediliyor...');
    setIsConfirming(true);
    setError(null);
    
    try {
      console.log('🌐 Real API service çağrısı yapılıyor...', {
        courseId,
        selectedTopicsCount: selectedTopics.length,
        service: 'confirmTopics'
      });

      // Call the real backend API
      const startTime = performance.now();
      await confirmTopics(courseId, selectedTopics);
      const endTime = performance.now();
      const apiDuration = endTime - startTime;

      console.log('✅ Konular başarıyla kaydedildi:', {
        confirmedTopicsCount: selectedTopics.length,
        apiDuration: `${apiDuration.toFixed(2)}ms`,
        nextStep: 'success',
        timestamp: new Date().toISOString()
      });

      setStep('success');
      
      console.log('🔄 Learning targets yenileniyor...');
      // Refresh learning targets after confirmation
      await fetchTargets('current-user', courseId);
      console.log('✅ Learning targets başarıyla yenilendi');
      
      console.log('🎉 handleConfirm başarıyla tamamlandı!');
    } catch (error) {
      console.error('❌ Konular kaydetme HATASI:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
        errorStack: error instanceof Error ? error.stack : 'Stack yok',
        selectedTopicsCount: selectedTopics.length,
        courseId,
        timestamp: new Date().toISOString()
      });

      console.error('Error confirming topics:', error);
      setError('Konular kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      console.log('🏁 Confirming durumu false yapılıyor...');
      setIsConfirming(false);
      console.log('💥 handleConfirm işlemi sonlandı');
      console.groupEnd();
    }
  };

  const handleClose = () => {
    console.group('🚪 [ProposeLearningTopics] handleClose - Dialog kapatılıyor');
    console.log('📋 Mevcut state:', {
      step,
      contextTextLength: contextText.length,
      proposedTopicsCount: proposedTopics.length,
      selectedTopicsCount: selectedTopics.length,
      hasError: !!error,
      timestamp: new Date().toISOString()
    });

    console.log('🧹 State temizleniyor...');
    // Reset state
    setContextText('');
    setProposedTopics([]);
    setSelectedTopics([]);
    setError(null);
    setStep('input');
    
    console.log('📞 onClose callback çağrılıyor...');
    onClose();
    
    console.log('🎉 handleClose başarıyla tamamlandı!');
    console.groupEnd();
  };

  const handleBack = () => {
    console.group('⬅️ [ProposeLearningTopics] handleBack - Geri navigasyon');
    console.log('📋 Navigasyon bilgileri:', {
      currentStep: step,
      nextStep: 'input',
      proposedTopicsCount: proposedTopics.length,
      selectedTopicsCount: selectedTopics.length,
      timestamp: new Date().toISOString()
    });

    console.log('📊 Step güncelleniyor: review -> input');
    setStep('input');
    
    console.log('🎉 handleBack başarıyla tamamlandı!');
    console.groupEnd();
  };

  // Render content based on current step
  const renderContent = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <Typography variant="body1" gutterBottom>
              Ders notlarınızı veya ilgili metni aşağıya yapıştırın. Yapay zeka, bu içeriği analiz ederek öğrenmeniz gereken yeni konuları önerecektir.
            </Typography>
            
            {existingTopics.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
                  <InfoIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                  Mevcut Konular ({existingTopics.length})
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {existingTopics.slice(0, 5).map((topic, index) => (
                    <Chip key={index} label={topic} size="small" />
                  ))}
                  {existingTopics.length > 5 && (
                    <Chip label={`+${existingTopics.length - 5} daha`} size="small" />
                  )}
                </Box>
              </Paper>
            )}
            
            <TextField
              label="Analiz Edilecek Metin"
              multiline
              rows={8}
              fullWidth
              value={contextText}
              onChange={handleContextChange}
              placeholder="Ders notları, makale veya ilgili içeriği buraya yapıştırın..."
              variant="outlined"
            />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </>
        );
        
      case 'review':
        return (
          <>
            <Typography variant="body1" gutterBottom>
              Yapay zeka, metin içinde aşağıdaki yeni konuları tespit etti. Öğrenme hedefi olarak eklemek istediklerinizi seçin.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <List sx={{ width: '100%' }}>
              {proposedTopics.map((topic) => {
                const isSelected = selectedTopics.some(t => t.tempId === topic.tempId);
                
                return (
                  <React.Fragment key={topic.tempId}>
                    <ListItem 
                      alignItems="flex-start"
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="select" 
                          onClick={() => handleTopicToggle(topic)}
                          color={isSelected ? "primary" : "default"}
                        >
                          {isSelected ? <AddCircleOutlineIcon color="primary" /> : <AddCircleOutlineIcon />}
                        </IconButton>
                      }
                    >
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={isSelected}
                          tabIndex={-1}
                          disableRipple
                          onChange={() => handleTopicToggle(topic)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <Typography variant="subtitle1">{topic.name}</Typography>
                            {topic.relevance && (
                              <Chip 
                                label={topic.relevance} 
                                size="small" 
                                color={topic.relevance === 'Yüksek' ? 'success' : 'primary'}
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                        secondary={topic.details}
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                );
              })}
            </List>
            
            {proposedTopics.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Metinde öğrenmeniz gereken yeni konular tespit edilemedi. Farklı bir metin deneyebilir veya manuel olarak öğrenme hedefi ekleyebilirsiniz.
              </Alert>
            )}
          </>
        );
        
      case 'success':
        return (
          <Box textAlign="center" py={2}>
            <Typography variant="h6" color="success.main" gutterBottom>
              Seçilen konular başarıyla öğrenme hedeflerinize eklendi!
            </Typography>
            <Typography variant="body1">
              {selectedTopics.length} yeni öğrenme hedefi oluşturuldu. Öğrenme hedefleri sayfasından bu konuları yönetebilirsiniz.
            </Typography>
          </Box>
        );
    }
  };

  // Render dialog actions based on current step
  const renderActions = () => {
    switch (step) {
      case 'input':
        return (
          <>
            <Button onClick={handleClose}>
              İptal
            </Button>
            <Button 
              onClick={handlePropose} 
              variant="contained" 
              color="primary"
              disabled={isLoading || !contextText.trim()}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Analiz Ediliyor...
                </>
              ) : (
                'Konuları Öner'
              )}
            </Button>
          </>
        );
        
      case 'review':
        return (
          <>
            <Button onClick={handleBack} disabled={isConfirming}>
              Geri
            </Button>
            <Button 
              onClick={handleConfirm} 
              variant="contained" 
              color="primary"
              disabled={isConfirming || selectedTopics.length === 0}
            >
              {isConfirming ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Kaydediliyor...
                </>
              ) : (
                `${selectedTopics.length} Konuyu Ekle`
              )}
            </Button>
          </>
        );
        
      case 'success':
        return (
          <Button onClick={handleClose} variant="contained" color="primary">
            Tamam
          </Button>
        );
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { maxHeight: '90vh' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {step === 'input' && 'Yapay Zeka ile Yeni Konular Öner'}
            {step === 'review' && 'Önerilen Konuları İncele'}
            {step === 'success' && 'Konular Eklendi'}
          </Typography>
          <IconButton aria-label="close" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        {renderContent()}
      </DialogContent>
      
      <DialogActions>
        {renderActions()}
      </DialogActions>
    </Dialog>
  );
};

export default ProposeLearningTopics;
