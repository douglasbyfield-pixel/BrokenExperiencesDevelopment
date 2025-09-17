import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import IssueDetailScreen from './IssueDetailScreen';
import { DataService } from '../services/dataService';
import type { Issue } from '../types/database';

interface IssueDetailWrapperProps {
  route: {
    params: {
      issueId: string;
    };
  };
  navigation: any;
}

export default function IssueDetailWrapper({ route, navigation }: IssueDetailWrapperProps) {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const loadIssueData = async () => {
      try {
        // Load all issues for navigation
        const issues = await DataService.getIssues();
        setAllIssues(issues);
        
        // Find the specific issue
        const targetIssue = issues.find(i => i.id === route.params.issueId);
        setIssue(targetIssue || null);
      } catch (error) {
        console.error('Error loading issue:', error);
      }
    };

    loadIssueData();
  }, [route.params.issueId]);

  const handleNavigateToIssue = (issueId: string) => {
    navigation.setParams({ issueId });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <IssueDetailScreen
        issue={issue}
        visible={true}
        onClose={handleClose}
        onNavigateToIssue={handleNavigateToIssue}
        allIssues={allIssues}
      />
    </View>
  );
}