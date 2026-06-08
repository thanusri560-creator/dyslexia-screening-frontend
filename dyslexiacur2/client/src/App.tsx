import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";

// Pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import ParentDashboard from "./pages/dashboards/ParentDashboard";
import TeacherDashboard from "./pages/dashboards/TeacherDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import Screening from "./pages/Screening";
import Results from "./pages/Results";
import Recommendations from "./pages/Recommendations";
import Progress from "./pages/Progress";
import Help from "./pages/Help";
import Accessibility from "./pages/Accessibility";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />

      {/* Protected Routes */}
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/student-dashboard"} component={StudentDashboard} />
      <Route path={"/parent-dashboard"} component={ParentDashboard} />
      <Route path={"/teacher-dashboard"} component={TeacherDashboard} />
      <Route path={"/admin-dashboard"} component={AdminDashboard} />
      <Route path={"/screening"} component={Screening} />
      <Route path={"/results"} component={Results} />
      <Route path={"/recommendations"} component={Recommendations} />
      <Route path={"/progress"} component={Progress} />
      <Route path={"/help"} component={Help} />
      <Route path={"/accessibility"} component={Accessibility} />

      {/* 404 Fallback */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AccessibilityProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
