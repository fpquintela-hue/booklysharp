'use client';

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Search, PlusCircle, LayoutDashboard, BarChart3, Users } from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useAuth } from "@/context/auth-context";
import { useTranslation } from "@/hooks/useTranslation";
import { AppointmentDialog } from "./AppointmentDialog";

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useTranslation()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-muted-foreground bg-muted/50 hover:bg-muted rounded-full border border-border transition-colors group"
            >
                <Search className="w-4 h-4 opacity-50 group-hover:text-primary group-hover:opacity-100 transition-colors" />
                <span className="hidden sm:inline-flex">Buscar o comando...</span>
                <span className="sm:hidden">Buscar</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList className="glass-panel border-white/10 dark:bg-slate-900/95 backdrop-blur-2xl">
                    <CommandEmpty>No results found.</CommandEmpty>

                    <CommandGroup heading="Acciones Rápidas">
                        <CommandItem
                            onSelect={() => {
                                setOpen(false);
                                // We dispatch a custom event that a listener in the layout/header will handle to open the dialog
                                window.dispatchEvent(new Event('openGlobalAppointmentDialog'));
                            }}
                            className="cursor-pointer"
                        >
                            <PlusCircle className="mr-2 h-4 w-4 text-emerald-500" />
                            <span>Nueva Cita</span>
                        </CommandItem>
                    </CommandGroup>

                    <CommandSeparator />

                    <CommandGroup heading="Navegación">
                        <CommandItem onSelect={() => runCommand(() => router.push('/'))} className="cursor-pointer">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Agenda Principal</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push('/patients'))} className="cursor-pointer">
                            <Users className="mr-2 h-4 w-4" />
                            <span>Directorio de Usuarios</span>
                        </CommandItem>
                        {user?.role === 'ADMIN' && (
                            <CommandItem onSelect={() => runCommand(() => router.push('/stats'))} className="cursor-pointer">
                                <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                                <span>Estadísticas (Admin)</span>
                            </CommandItem>
                        )}
                        {user?.role === 'ADMIN' && (
                            <CommandItem onSelect={() => runCommand(() => router.push('/userapp'))} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4 text-amber-500" />
                                <span>Gestión de Staff (Admin)</span>
                            </CommandItem>
                        )}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
