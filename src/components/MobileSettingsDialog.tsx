'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { userService } from '@/lib/mock-service';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Moon, Sun, Lock, Palette, X, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';

export function MobileSettingsDialog() {
    const [open, setOpen] = useState(false);
    const { setTheme, theme } = useTheme();
    const { user, updateUser } = useAuth();
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<'appearance' | 'security'>('appearance');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (newPassword !== confirmPassword) {
            toast.error(t('settings.password_error_match'));
            return;
        }

        if (newPassword.length < 4) {
            toast.error(t('settings.password_error_length'));
            return;
        }

        if (user.password && user.password !== currentPassword) {
            toast.error(t('settings.password_error_current'));
            return;
        }

        setLoading(true);
        try {
            await userService.updateUser(user.id, { password: newPassword });
            toast.success(t('settings.password_success'));
            setOpen(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error(t('settings.error_saving'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="p-2 text-muted-foreground hover:bg-black/5 rounded-lg dark:text-muted-foreground dark:hover:bg-white/5 transition-colors">
                    <Menu className="h-6 w-6" />
                </button>
            </DialogTrigger>
            <DialogContent showCloseButton={false} className="max-w-[100vw] sm:max-w-none w-full h-[100dvh] max-h-[100dvh] m-0 p-0 rounded-none border-none flex flex-col pt-safe bg-background">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <DialogTitle className="text-xl font-bold text-primary">Ajustes</DialogTitle>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs Mobile */}
                <div className="flex p-2 gap-2 border-b border-border bg-muted/30">
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
                            activeTab === 'appearance'
                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                : "text-muted-foreground"
                        )}
                    >
                        <Palette className="w-4 h-4" />
                        Apariencia
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all",
                            activeTab === 'security'
                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                : "text-muted-foreground"
                        )}
                    >
                        <Lock className="w-4 h-4" />
                        Seguridad
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                    {activeTab === 'appearance' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div className="space-y-3">
                                <Label className="text-base font-bold text-foreground">Tema</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={async () => {
                                            setTheme('light');
                                            if (user) {
                                                updateUser({ theme: 'light' });
                                                await userService.updateUser(user.id, { theme: 'light' });
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                            theme === 'light'
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border text-muted-foreground"
                                        )}
                                    >
                                        <Sun className="h-6 w-6" />
                                        <span className="font-bold text-sm">Claro</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setTheme('dark');
                                            if (user) {
                                                updateUser({ theme: 'dark' });
                                                await userService.updateUser(user.id, { theme: 'dark' });
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                            theme === 'dark'
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border text-muted-foreground"
                                        )}
                                    >
                                        <Moon className="h-6 w-6" />
                                        <span className="font-bold text-sm">Oscuro</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                <Label className="text-base font-bold text-foreground">Estilo Calendario</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={async () => {
                                            if (user) {
                                                updateUser({ calendarViewMode: 'vista1' });
                                                await userService.updateUser(user.id, { calendarViewMode: 'vista1' });
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                                            (user?.calendarViewMode === 'vista1' || !user?.calendarViewMode)
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="font-bold text-sm">Moderno</span>
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (user) {
                                                updateUser({ calendarViewMode: 'vista2' });
                                                await userService.updateUser(user.id, { calendarViewMode: 'vista2' });
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                                            user?.calendarViewMode === 'vista2'
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border text-muted-foreground"
                                        )}
                                    >
                                        <span className="font-bold text-sm">Clásica</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-border">
                                <Label className="text-base font-bold text-foreground">Idioma</Label>
                                <div className="w-full">
                                    <Select
                                        value={user?.language || 'es'}
                                        onValueChange={async (val) => {
                                            if (user) {
                                                updateUser({ language: val });
                                                await userService.updateUser(user.id, { language: val });
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-12 bg-background border-border">
                                            <SelectValue placeholder="Selecciona un idioma" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                                            <SelectItem value="gl">🇪🇸 Galego</SelectItem>
                                            <SelectItem value="eu">🟢 Euskera</SelectItem>
                                            <SelectItem value="ca">🟡 Català</SelectItem>
                                            <SelectItem value="pt">🇵🇹 Português</SelectItem>
                                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                                            <SelectItem value="it">🇮🇹 Italiano</SelectItem>
                                            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                                            <SelectItem value="pl">🇵🇱 Polski</SelectItem>
                                            <SelectItem value="en">🇬🇧 English</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6 animate-in fade-in">
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Contraseña</h3>
                                <p className="text-sm text-muted-foreground mt-1 text-pretty">Mantén tu contraseña actualizada para mayor seguridad.</p>
                            </div>

                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Contraseña Actual</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Nueva Contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold">Repita Nueva Contraseña</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl mt-4 font-bold"
                                    disabled={loading}
                                >
                                    {loading ? "Guardando..." : "Actualizar Contraseña"}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
