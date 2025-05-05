
import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Database, ShieldAlert, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface DatabaseIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  entity: string;
  description: string;
  solution?: string;
  fixCommand?: string;
}

const DatabaseAdvisor = () => {
  const [issues, setIssues] = useState<DatabaseIssue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkUserRole();
    scanDatabaseIssues();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setUserRole(userData?.role || null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const scanDatabaseIssues = async () => {
    setIsLoading(true);
    try {
      // Collect database issues (in a real app, this would query the database for actual issues)
      const foundIssues: DatabaseIssue[] = [
        {
          id: '1',
          type: 'error',
          entity: 'public.update_notification_updated_at',
          description: 'Detects functions where the search_path parameter is not set.',
          solution: 'Add explicit search_path parameter to the function.',
          fixCommand: 'ALTER FUNCTION public.update_notification_updated_at() SET search_path = "public";'
        },
        {
          id: '2',
          type: 'warning',
          entity: 'public.postgis',
          description: 'Detects extensions installed in the \'public\' schema.',
          solution: 'Extensions should be installed in dedicated schemas.',
          fixCommand: 'No automatic fix available. Consider reinstalling the extension in a dedicated schema.'
        },
        {
          id: '3', 
          type: 'warning',
          entity: 'Auth',
          description: 'OTP expiry exceeds recommended threshold',
          solution: 'Reduce the OTP expiry time in Authentication settings.',
          fixCommand: 'Configure authentication settings via the Supabase dashboard.'
        },
        {
          id: '4',
          type: 'warning',
          entity: 'Auth',
          description: 'Leaked password protection is currently disabled.',
          solution: 'Enable leaked password protection in Authentication settings.',
          fixCommand: 'Configure authentication settings via the Supabase dashboard.'
        },
        {
          id: '5',
          type: 'warning',
          entity: 'public.spatial_ref_sys',
          description: 'Detects cases where row level security (RLS) has not been enabled on tables in schemas exposed to PostgreSQL.',
          solution: 'Enable RLS on public tables.',
          fixCommand: 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;'
        }
      ];

      setIssues(foundIssues);
    } catch (error) {
      console.error('Error scanning database issues:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في فحص قاعدة البيانات',
        description: 'حدث خطأ أثناء محاولة فحص مشاكل قاعدة البيانات'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fixIssue = async (command: string) => {
    try {
      // Execute SQL command via RPC
      const { error } = await supabase.rpc('execute_sql', { query: command });
      
      if (error) throw error;
      
      toast({
        title: 'تم إصلاح المشكلة',
        description: 'تم تنفيذ أمر الإصلاح بنجاح'
      });
      
      // Refresh the issues list
      await scanDatabaseIssues();
    } catch (error) {
      console.error('Error fixing issue:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في إصلاح المشكلة',
        description: 'حدث خطأ أثناء محاولة تنفيذ أمر الإصلاح'
      });
    }
  };

  // If user is not owner, don't render component
  if (userRole !== 'owner') {
    return null;
  }

  const errorCount = issues.filter(issue => issue.type === 'error').length;
  const warningCount = issues.filter(issue => issue.type === 'warning').length;
  const infoCount = issues.filter(issue => issue.type === 'info').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl mb-2">مستشار قاعدة البيانات</CardTitle>
            <CardDescription>مشاكل وتحسينات لقاعدة البيانات</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scanDatabaseIssues} 
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">الكل ({issues.length})</TabsTrigger>
            <TabsTrigger value="errors" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              أخطاء ({errorCount})
            </TabsTrigger>
            <TabsTrigger value="warnings" className="flex items-center gap-1">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              تحذيرات ({warningCount})
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1">
              <Info className="h-4 w-4 text-blue-500" />
              اقتراحات ({infoCount})
            </TabsTrigger>
          </TabsList>
          
          {['all', 'errors', 'warnings', 'info'].map(tab => (
            <TabsContent key={tab} value={tab}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">نوع المشكلة</TableHead>
                    <TableHead className="w-[200px]">الكيان</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead className="w-[150px]">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issues
                    .filter(issue => {
                      if (tab === 'all') return true;
                      if (tab === 'errors') return issue.type === 'error';
                      if (tab === 'warnings') return issue.type === 'warning';
                      if (tab === 'info') return issue.type === 'info';
                      return true;
                    })
                    .map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {issue.type === 'error' && <AlertCircle className="h-5 w-5 text-red-500 mr-1" />}
                            {issue.type === 'warning' && <ShieldAlert className="h-5 w-5 text-amber-500 mr-1" />}
                            {issue.type === 'info' && <Info className="h-5 w-5 text-blue-500 mr-1" />}
                            <span>
                              {issue.type === 'error' && 'خطأ'}
                              {issue.type === 'warning' && 'تحذير'}
                              {issue.type === 'info' && 'معلومة'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Database className="h-4 w-4 mr-2" />
                            <code className="bg-muted px-1 text-sm rounded">{issue.entity}</code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{issue.description}</p>
                            {issue.solution && (
                              <p className="text-sm text-muted-foreground mt-1">
                                الحل: {issue.solution}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {issue.fixCommand ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => fixIssue(issue.fixCommand!)}
                            >
                              إصلاح المشكلة
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">إصلاح يدوي</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DatabaseAdvisor;
