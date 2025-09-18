import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useComment } from '../context/CommentContext';

interface CommentInputProps {
  issueId: string;
  parentId?: string;
  placeholder?: string;
  onCommentAdded?: () => void;
  maxLength?: number;
}

export default function CommentInput({ 
  issueId, 
  parentId, 
  placeholder = "Add a comment...", 
  onCommentAdded,
  maxLength = 500 
}: CommentInputProps) {
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { addComment } = useComment();

  const handleSubmit = () => {
    if (!text.trim()) return;

    if (text.length > maxLength) {
      Alert.alert('Comment too long', `Comments must be ${maxLength} characters or less.`);
      return;
    }

    addComment(issueId, text.trim(), parentId);
    setText('');
    setIsExpanded(false);
    onCommentAdded?.();
  };

  const handleCancel = () => {
    setText('');
    setIsExpanded(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.textInput, isExpanded && styles.textInputExpanded]}
          placeholder={placeholder}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={maxLength}
          onFocus={() => setIsExpanded(true)}
          placeholderTextColor="#999"
        />
        {isExpanded && (
          <View style={styles.actionsContainer}>
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {text.length}/{maxLength}
              </Text>
            </View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitButton, !text.trim() && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!text.trim()}
              >
                <Text style={[styles.submitButtonText, !text.trim() && styles.submitButtonTextDisabled]}>
                  Post
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    padding: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 40,
    maxHeight: 120,
  },
  textInputExpanded: {
    minHeight: 80,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  characterCount: {
    flex: 1,
  },
  characterCountText: {
    fontSize: 12,
    color: '#999',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999',
  },
});
