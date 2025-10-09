"use client";

import { useState } from 'react';
import { Button } from '@web/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Textarea } from '@web/components/ui/textarea';
import { useAuth } from '@web/components/auth-provider';
import { Bell, TestTube, Users, MapPin, Settings } from 'lucide-react';

export default function NotificationTestPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello! This is a test notification from Broken Experiences.');
  const [adminToken, setAdminToken] = useState('');

  const runTest = async (testType: string, data: any = {}) => {
    setLoading(true);
    setResults(null);
    
    try {
      const response = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
        },
        body: JSON.stringify({
          testType,
          userId: user?.id,
          message: testMessage,
          ...data
        }),
      });

      const result = await response.json();
      setResults({
        success: response.ok,
        status: response.status,
        data: result,
        testType
      });
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        testType
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setResults({
        success: permission === 'granted',
        data: { permission },
        testType: 'permission_check'
      });
      
      if (permission === 'granted') {
        // Show a test browser notification
        new Notification('🧪 Browser Test', {
          body: 'Browser notifications are working!',
          icon: '/images/logo.png'
        });
      }
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : 'Permission request failed',
        testType: 'permission_check'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Push Notification Testing Center
          </h1>
          <p className="text-gray-600">
            Test and debug the push notification system for Broken Experiences
          </p>
        </div>

        {/* Admin Token Input */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminToken">Admin Token (Required for API tests)</Label>
              <Input
                id="adminToken"
                type="password"
                placeholder="Enter admin token..."
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="testMessage">Test Message</Label>
              <Textarea
                id="testMessage"
                placeholder="Custom test notification message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Browser Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={testNotificationPermission}
                className="w-full"
                variant="outline"
              >
                Test Browser Permission
              </Button>
              <p className="text-sm text-gray-600">
                Tests if browser notifications work and requests permission
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5" />
                Environment Check
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => runTest('check_environment')}
                disabled={loading || !adminToken}
                className="w-full"
                variant="outline"
              >
                Check Environment Variables
              </Button>
              <p className="text-sm text-gray-600">
                Verifies all required environment variables are set
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Subscription Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => runTest('list_subscriptions')}
                disabled={loading || !adminToken}
                className="w-full"
                variant="outline"
              >
                List All Subscriptions
              </Button>
              <Button 
                onClick={() => runTest('test_single_notification')}
                disabled={loading || !adminToken || !user}
                className="w-full"
              >
                Send Test Notification
              </Button>
              <p className="text-sm text-gray-600">
                Tests push notification delivery to your device
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Proximity Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => runTest('test_proximity')}
                disabled={loading || !adminToken}
                className="w-full"
                variant="outline"
              >
                Test Proximity Notifications
              </Button>
              <p className="text-sm text-gray-600">
                Tests proximity-based notifications with mock data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success ? '✅' : '❌'} Test Results: {results.testType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">1. First Time Setup:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Set your admin token (check your environment variables)</li>
                <li>Run "Check Environment Variables" to verify setup</li>
                <li>Test browser permission to ensure notifications work</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. Test Push Subscriptions:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Enable notifications in your profile page first</li>
                <li>Check "List All Subscriptions" to see registered devices</li>
                <li>Send a test notification to verify delivery</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Test Proximity Features:</h4>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>Run proximity test to verify location-based notifications</li>
                <li>Create a new experience to test real proximity triggers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}