import { supabase } from './supabase';

export class DiagnosticsService {
  static async runMapDiagnostics() {
    console.log('🔍 DIAGNOSTICS: Starting map markers investigation...');
    
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('🔍 DIAGNOSTICS: Current user:', user?.id || 'Not authenticated');
      if (authError) {
        console.error('🔍 DIAGNOSTICS: Auth error:', authError);
      }

      // Test raw issues query
      console.log('🔍 DIAGNOSTICS: Testing raw issues query...');
      const { data: rawIssues, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (issuesError) {
        console.error('🔍 DIAGNOSTICS: Raw issues query error:', issuesError);
        return;
      }

      console.log('🔍 DIAGNOSTICS: Raw issues count:', rawIssues?.length || 0);

      if (rawIssues && rawIssues.length > 0) {
        // Check coordinate data types and values
        console.log('🔍 DIAGNOSTICS: Analyzing first 5 issues...');
        rawIssues.slice(0, 5).forEach((issue, index) => {
          console.log(`🔍 DIAGNOSTICS: Issue ${index + 1}:`, {
            id: (issue as any).id,
            title: (issue as any).title,
            latitude: (issue as any).latitude,
            latType: typeof (issue as any).latitude,
            longitude: (issue as any).longitude,
            lngType: typeof (issue as any).longitude,
            isValidLat: (issue as any).latitude !== null && (issue as any).latitude !== undefined && !isNaN(parseFloat((issue as any).latitude)),
            isValidLng: (issue as any).longitude !== null && (issue as any).longitude !== undefined && !isNaN(parseFloat((issue as any).longitude))
          });
        });

        // Count issues with coordinates
        const withCoords = rawIssues.filter((issue: any) => 
          issue.latitude !== null && issue.latitude !== undefined && 
          issue.longitude !== null && issue.longitude !== undefined &&
          !isNaN(parseFloat(issue.latitude)) && !isNaN(parseFloat(issue.longitude))
        );
        
        console.log('🔍 DIAGNOSTICS: Issues with coordinates:', withCoords.length, 'out of', rawIssues.length);

        // Test with profile join
        console.log('🔍 DIAGNOSTICS: Testing with profile join...');
        const { data: joinedIssues, error: joinError } = await supabase
          .from('issues')
          .select(`
            *,
            profiles:reported_by (
              id,
              name,
              avatar
            )
          `)
          .order('created_at', { ascending: false });

        if (joinError) {
          console.error('🔍 DIAGNOSTICS: Join query error:', joinError);
        } else {
          console.log('🔍 DIAGNOSTICS: Joined issues count:', joinedIssues?.length || 0);
          
          if (joinedIssues && joinedIssues.length > 0) {
            const joinedWithCoords = joinedIssues.filter((issue: any) => 
              issue.latitude && issue.longitude && 
              !isNaN(parseFloat(issue.latitude)) && !isNaN(parseFloat(issue.longitude))
            );
            console.log('🔍 DIAGNOSTICS: Joined issues with coordinates:', joinedWithCoords.length);
          }
        }

        // Test if it's an RLS issue by checking different contexts
        console.log('🔍 DIAGNOSTICS: Testing RLS context...');
        const { data: publicIssues, error: publicError } = await supabase
          .rpc('get_public_issues_test') // This would need to be created as a function
          .select();

        if (publicError && !publicError.message.includes('does not exist')) {
          console.error('🔍 DIAGNOSTICS: Public RPC error:', publicError);
        }

      } else {
        console.log('🔍 DIAGNOSTICS: ❌ No issues found at all!');
      }

    } catch (error) {
      console.error('🔍 DIAGNOSTICS: Error during diagnostics:', error);
    }
  }

  static async testCoordinateValidation() {
    console.log('🔍 COORD TEST: Testing coordinate validation logic...');
    
    // Test data that should pass/fail validation
    const testIssues = [
      { id: '1', title: 'Valid coords', latitude: 18.1500, longitude: -77.3000 },
      { id: '2', title: 'String coords', latitude: '18.1500', longitude: '-77.3000' },
      { id: '3', title: 'Null lat', latitude: null, longitude: -77.3000 },
      { id: '4', title: 'NaN coords', latitude: NaN, longitude: NaN },
      { id: '5', title: 'Zero coords', latitude: 0, longitude: 0 },
      { id: '6', title: 'Undefined', latitude: undefined, longitude: undefined }
    ];

    testIssues.forEach(issue => {
      const isValid = issue.latitude && issue.longitude && 
        !isNaN(issue.latitude as any) && !isNaN(issue.longitude as any);
      console.log(`🔍 COORD TEST: ${issue.title}:`, {
        lat: issue.latitude,
        lng: issue.longitude,
        valid: isValid
      });
    });
  }
}