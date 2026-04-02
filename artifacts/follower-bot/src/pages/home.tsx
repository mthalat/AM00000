import React from "react";
import { 
  useGetStats, 
  useGetLeaderboard, 
  useGetTasks 
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Trophy, 
  Users, 
  Target, 
  Zap, 
  Share2, 
  Star, 
  ArrowLeft,
  Crown,
  Gift,
  Rocket
} from "lucide-react";
import { FaTelegram } from "react-icons/fa";

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetStats({
    query: {
      refetchInterval: 30000,
    }
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard(
    { limit: 10 },
    { query: { refetchInterval: 60000 } }
  );

  const { data: tasks, isLoading: tasksLoading } = useGetTasks();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[120px] mix-blend-screen" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-16">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pt-10">
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-bold bg-secondary/20 text-secondary hover:bg-secondary/30 rounded-full">
            <Rocket className="w-4 h-4 ml-2 inline-block" />
            أقوى بوت لزيادة المتابعين
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">
            بوت تبادل المتابعين الذكي
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl font-medium leading-relaxed">
            اكسب النقاط، نفذ المهام، وشارك مع أصدقائك للحصول على آلاف المتابعين الحقيقيين في حساباتك على السوشيال ميديا!
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <a href="https://t.me/SmartFollowBot" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                <FaTelegram className="ml-2 w-6 h-6" />
                ابدأ الاستخدام الآن
              </Button>
            </a>
          </div>
        </section>

        {/* Live Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-150 fill-mode-both">
          <StatCard 
            icon={<Users className="w-6 h-6 text-blue-500" />} 
            title="المستخدمين" 
            value={stats?.totalUsers.toLocaleString()} 
            loading={statsLoading}
          />
          <StatCard 
            icon={<Target className="w-6 h-6 text-green-500" />} 
            title="مهام مكتملة" 
            value={stats?.tasksCompleted.toLocaleString()} 
            loading={statsLoading}
          />
          <StatCard 
            icon={<Zap className="w-6 h-6 text-yellow-500" />} 
            title="نقاط موزعة" 
            value={stats?.totalPointsDistributed.toLocaleString()} 
            loading={statsLoading}
          />
          <StatCard 
            icon={<Star className="w-6 h-6 text-purple-500" />} 
            title="أعضاء جدد اليوم" 
            value={stats?.todayNewUsers.toLocaleString()} 
            loading={statsLoading}
          />
        </section>

        {/* 5 Friends Unlock Feature */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 p-8 md:p-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-both">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Share2 className="w-48 h-48" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-2xl mb-2 text-primary">
                <Share2 className="w-8 h-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">شارك مع 5 أصدقاء لفك القفل!</h2>
              <p className="text-lg text-muted-foreground">
                البوت مجاني بالكامل! كل ما عليك فعله للبدء في استخدام الميزات المتقدمة وزيادة متابعيك هو دعوة 5 من أصدقائك عبر الرابط الخاص بك.
              </p>
              <ul className="space-y-3 mt-4">
                <FeatureItem text="نقاط مجانية عند انضمام كل صديق" />
                <FeatureItem text="فتح قسم المهام الحصرية (VIP)" />
                <FeatureItem text="مضاعفة أرباحك من عجلة الحظ اليومية" />
              </ul>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
               <a href="https://t.me/SmartFollowBot" target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="secondary" className="w-full text-lg h-14 rounded-full px-8 font-bold">
                  احصل على رابط الدعوة
                  <ArrowLeft className="w-5 h-5 mr-2" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500 fill-mode-both">
          {/* Leaderboard */}
          <Card className="border-primary/10 shadow-lg shadow-black/5 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl">
                <Trophy className="w-6 h-6 ml-3 text-yellow-500" />
                قائمة الصدارة
              </CardTitle>
              <CardDescription>أفضل المستخدمين تحقيقاً للنقاط</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {leaderboardLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard?.slice(0, 5).map((user, idx) => (
                    <div key={user.telegramId} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500/20 text-yellow-600' : 
                          idx === 1 ? 'bg-slate-300/50 text-slate-600' : 
                          idx === 2 ? 'bg-orange-500/20 text-orange-600' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {user.rank}
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            {user.firstName}
                            {user.vipLevel > 0 && <Crown className="w-3 h-3 text-yellow-500" />}
                          </div>
                          <div className="text-xs text-muted-foreground">@{user.username || 'مستخدم'}</div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono text-sm">
                        {user.points.toLocaleString()} نقطة
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Tasks Sample */}
          <Card className="border-primary/10 shadow-lg shadow-black/5 flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-2xl">
                <Gift className="w-6 h-6 ml-3 text-primary" />
                مهام نشطة
              </CardTitle>
              <CardDescription>أمثلة على المهام المتوفرة في البوت</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {tasksLoading ? (
                <div className="space-y-4">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks?.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold">{task.taskType === 'follow' ? 'متابعة حساب' : 'تفاعل'}</div>
                          <div className="text-sm text-muted-foreground">{task.platform}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm text-muted-foreground mb-1">المكافأة</span>
                        <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-0">
                          +{task.pointsReward} نقطة
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {(!tasks || tasks.length === 0) && (
                    <div className="text-center p-8 text-muted-foreground">
                      لا توجد مهام نشطة حالياً.
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <a href="https://t.me/SmartFollowBot" target="_blank" rel="noopener noreferrer">
                   <Button variant="outline" className="w-full rounded-xl">
                    عرض المزيد من المهام في البوت
                   </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 text-muted-foreground border-t border-border mt-8">
          <p>© {new Date().getFullYear()} بوت تبادل المتابعين الذكي. جميع الحقوق محفوظة.</p>
        </footer>

      </div>
    </div>
  );
}

function StatCard({ icon, title, value, loading }: { icon: React.ReactNode, title: string, value?: string, loading: boolean }) {
  return (
    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
        <div className="p-3 bg-muted rounded-2xl">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-20 mx-auto" />
          ) : (
            <p className="text-2xl font-bold tracking-tight">{value || "0"}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <span className="font-medium text-foreground">{text}</span>
    </li>
  );
}
