import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, User } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 mb-8">
        Manage your account and preferences.
      </p>

      <div className="space-y-4">
        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Profile</CardTitle>
                <CardDescription>
                  Manage your name, email, and password.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Profile settings coming soon.
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03] backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gray-500 to-gray-600">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Preferences</CardTitle>
                <CardDescription>
                  Theme, notifications, and integrations.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Preference settings coming soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
