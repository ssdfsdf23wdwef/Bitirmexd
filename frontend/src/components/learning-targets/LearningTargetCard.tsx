import React, { useState, useCallback, memo, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { LearningTarget, LearningTargetStatus } from '../../types/learning-target.types';
import { useLearningTargetsStore } from '../../store/useLearningTargetsStore';

interface LearningTargetCardProps {
  target: LearningTarget;
}

const LearningTargetCard: React.FC<LearningTargetCardProps> = memo(({ target }) => {
  const { updateTarget, deleteTarget } = useLearningTargetsStore();
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedTarget, setEditedTarget] = useState(target);
  
  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditClick = useCallback(() => {
    setEditDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  }, [handleMenuClose]);

  const handleEditDialogClose = useCallback(() => {
    setEditDialogOpen(false);
    setEditedTarget(target); // Reset to original values
  }, [target]);

  const handleDeleteDialogClose = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    await updateTarget(target.id, editedTarget);
    setEditDialogOpen(false);
  }, [target.id, editedTarget, updateTarget]);

  const handleConfirmDelete = useCallback(async () => {
    await deleteTarget(target.id);
    setDeleteDialogOpen(false);
  }, [target.id, deleteTarget]);

  const handleStatusChange = useCallback(async (newStatus: LearningTargetStatus) => {
    await updateTarget(target.id, { status: newStatus });
  }, [target.id, updateTarget]);

  // Card styling based on status - Memoized for performance
  const statusColor = useMemo(() => {
    switch (target.status) {
      case LearningTargetStatus.NOT_STARTED:
        return 'default';
      case LearningTargetStatus.IN_PROGRESS:
        return 'primary';
      case LearningTargetStatus.COMPLETED:
        return 'success';
      default:
        return 'default';
    }
  }, [target.status]);

  const statusIcon = useMemo(() => {
    switch (target.status) {
      case LearningTargetStatus.NOT_STARTED:
        return <PendingIcon fontSize="small" />;
      case LearningTargetStatus.IN_PROGRESS:
        return <RotateRightIcon fontSize="small" />;
      case LearningTargetStatus.COMPLETED:
        return <CheckCircleIcon fontSize="small" />;
      default:
        return <PendingIcon fontSize="small" />;
    }
  }, [target.status]);

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          borderLeft: `4px solid ${
            target.status === LearningTargetStatus.NOT_STARTED ? 'grey.400' :
            target.status === LearningTargetStatus.IN_PROGRESS ? 'primary.main' :
            'success.main'
          }`,
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="h6" component="h2" gutterBottom>
              {target.topicName}
            </Typography>
            <IconButton 
              aria-label="more" 
              id={`target-menu-${target.id}`}
              aria-controls={open ? `target-menu-${target.id}` : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onClick={handleMenuClick}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
          
          <Box mt={1} mb={2}>
            <Chip 
              icon={statusIcon} 
              label={target.status} 
              size="small" 
              color={statusColor}
              sx={{ mr: 1 }}
            />
            {target.isNewTopic && (
              <Chip 
                label="Yeni Konu" 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
          </Box>
          
          {target.notes && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {target.notes}
            </Typography>
          )}
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              {new Date(target.createdAt).toLocaleDateString('tr-TR')}
            </Typography>
            <Box>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleStatusChange(
                  target.status === LearningTargetStatus.NOT_STARTED 
                    ? LearningTargetStatus.IN_PROGRESS 
                    : LearningTargetStatus.COMPLETED
                )}
              >
                <SchoolIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu */}
      <Menu
        id={`target-menu-${target.id}`}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        MenuListProps={{
          'aria-labelledby': `target-menu-button-${target.id}`,
        }}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Öğrenme Hedefini Düzenle</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Konu Adı"
              fullWidth
              value={editedTarget.topicName}
              onChange={(e) => setEditedTarget({ ...editedTarget, topicName: e.target.value })}
              margin="dense"
            />
            
            <FormControl fullWidth margin="dense">
              <InputLabel id="status-select-label">Durum</InputLabel>
              <Select
                labelId="status-select-label"
                value={editedTarget.status}
                label="Durum"
                onChange={(e) => setEditedTarget({ 
                  ...editedTarget, 
                  status: e.target.value as LearningTargetStatus 
                })}
              >
                <MenuItem value={LearningTargetStatus.NOT_STARTED}>Başlanmadı</MenuItem>
                <MenuItem value={LearningTargetStatus.IN_PROGRESS}>Devam Ediyor</MenuItem>
                <MenuItem value={LearningTargetStatus.COMPLETED}>Tamamlandı</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Notlar"
              fullWidth
              multiline
              rows={3}
              value={editedTarget.notes || ''}
              onChange={(e) => setEditedTarget({ ...editedTarget, notes: e.target.value })}
              margin="dense"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>İptal</Button>
          <Button onClick={handleSaveEdit} variant="contained" color="primary">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Öğrenme Hedefini Sil</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            "{target.topicName}" öğrenme hedefini silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>İptal</Button>
          <Button onClick={handleConfirmDelete} variant="contained" color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LearningTargetCard;

// Memoization için custom comparison function
LearningTargetCard.displayName = 'LearningTargetCard';
