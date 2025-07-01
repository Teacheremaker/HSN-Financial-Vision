'use client';

<<<<<<< HEAD
<<<<<<< HEAD
import * as React from 'react';
=======
import { useState } from 'react';
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
<<<<<<< HEAD
<<<<<<< HEAD
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useServiceStore, PALETTE_COLORS, type ServiceDefinition } from '@/hooks/use-service-store';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Check, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

=======
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useServiceStore } from '@/hooks/use-service-store';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useServiceStore, PALETTE_COLORS, type ServiceDefinition } from '@/hooks/use-service-store';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Check, MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du service doit comporter au moins 2 caractères.",
  }),
<<<<<<< HEAD
<<<<<<< HEAD
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { 
    message: "La couleur doit être un code HEX valide (ex: #1a2b3c)." 
  }),
});

export default function ServicesPage() {
  const { services, addService, deleteService } = useServiceStore();
  const { toast } = useToast();
  const [serviceToDelete, setServiceToDelete] = React.useState<ServiceDefinition | null>(null);
=======
=======
  color: z.string().min(1, { message: "Veuillez choisir une couleur."}),
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
});

export default function ServicesPage() {
  const { services, addService } = useServiceStore();
  const { toast } = useToast();
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
<<<<<<< HEAD
<<<<<<< HEAD
      color: "#3b82f6",
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
      color: "",
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
<<<<<<< HEAD
<<<<<<< HEAD
=======
    // Check for duplicates, ignoring case and spaces
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
    if (services.some(s => s.name.trim().toLowerCase() === values.name.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: `Le service "${values.name}" existe déjà.`,
        });
        return;
    }
    
<<<<<<< HEAD
<<<<<<< HEAD
    addService(values.name, values.color);
=======
    addService(values.name);
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
    addService(values.name, values.color);
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
    toast({
        title: "Service ajouté",
        description: `Le service "${values.name}" a été créé avec succès.`,
    });
    form.reset();
  }

<<<<<<< HEAD
  const handleDeleteConfirm = () => {
    if (serviceToDelete) {
        deleteService(serviceToDelete.name);
        toast({
            title: "Service supprimé",
            description: `Le service "${serviceToDelete.name}" et toutes ses données associées ont été supprimés.`,
        });
        setServiceToDelete(null);
    }
  };

=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
  return (
    <div className="flex flex-col h-full">
      <Header title="Gestion des Services" />
      <main className="flex-1 space-y-4 p-4 md:p-8 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un nouveau service</CardTitle>
                    <CardDescription>
                        Créez un nouveau service qui sera disponible dans toute l'application.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
<<<<<<< HEAD
<<<<<<< HEAD
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent className="space-y-6">
=======
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent>
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent className="space-y-6">
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Nom du service</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex: Eau Potable" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
<<<<<<< HEAD
<<<<<<< HEAD
                            <FormField
=======
                             <FormField
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
<<<<<<< HEAD
                                        <FormLabel>Couleur du service</FormLabel>
                                        <FormControl>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-start text-left font-normal"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-4 w-4 rounded-full border"
                                                                style={{ backgroundColor: field.value }}
                                                            />
                                                            <div className="flex-1 truncate">
                                                                {field.value ? field.value.toUpperCase() : "Choisir une couleur"}
                                                            </div>
                                                        </div>
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0">
                                                    <div className="p-4">
                                                        <h4 className="text-sm font-medium mb-2">Palette de couleurs</h4>
                                                        <div className="grid grid-cols-8 gap-2">
                                                            {PALETTE_COLORS.map((color) => (
                                                                <button
                                                                    type="button"
                                                                    key={color}
                                                                    className={cn(
                                                                        "h-7 w-7 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110",
                                                                        field.value.toLowerCase() === color.toLowerCase()
                                                                            ? "border-primary"
                                                                            : "border-transparent"
                                                                    )}
                                                                    style={{ backgroundColor: color }}
                                                                    onClick={() => field.onChange(color)}
                                                                >
                                                                    {field.value.toLowerCase() === color.toLowerCase() && (
                                                                        <Check className="h-4 w-4 text-white" style={{mixBlendMode: 'difference'}}/>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <Separator className="my-4" />
                                                        <h4 className="text-sm font-medium mb-2">Couleur personnalisée</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-6 w-6 rounded-full border"
                                                                style={{ backgroundColor: field.value }}
                                                            />
                                                            <Input
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                className="flex-1"
                                                                placeholder="#RRGGBB"
                                                                maxLength={7}
                                                            />
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormDescription>
                                            Cette couleur sera utilisée dans les graphiques et les onglets.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
                                    <FormLabel>Couleur du service</FormLabel>
                                    <FormControl>
                                       <div className="flex flex-wrap gap-2">
                                            {PALETTE_COLORS.map((color) => (
                                                <button
                                                    type="button"
                                                    key={color}
                                                    className={cn(
                                                        "h-8 w-8 rounded-full border-2 transition-transform",
                                                        field.value === color
                                                        ? "border-primary scale-110"
                                                        : "border-transparent"
                                                    )}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => field.onChange(color)}
                                                />
                                            ))}
                                       </div>
                                    </FormControl>
                                    <FormDescription>
                                        Cette couleur sera utilisée dans les graphiques et les onglets.
                                    </FormDescription>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
                        </CardContent>
                        <CardFooter>
                            <Button type="submit">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Ajouter le service
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Services existants</CardTitle>
                <CardDescription>
                  Liste des services actuellement configurés dans l'application.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                    {services.map((service) => (
                        <li key={service.name} className="flex items-center justify-between p-2 rounded-md border">
                           <div className="flex items-center gap-3">
                             <div className="h-4 w-4 rounded-full" style={{ backgroundColor: service.color }} />
                             <span className="font-medium">{service.name}</span>
                           </div>
<<<<<<< HEAD
                           <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Ouvrir le menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                        onClick={() => setServiceToDelete(service)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
=======
                           {/* Delete functionality can be added here later */}
<<<<<<< HEAD
                           {/* <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                           </Button> */}
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
=======
>>>>>>> a3ccb67 (quand on ajoute un nouveau service pouvoir définir une couleur au choix)
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
        </div>
<<<<<<< HEAD
        <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Cette action est irréversible. La suppression du service "{serviceToDelete?.name}" entraînera la suppression de tous les tarifs, coûts et souscriptions associés dans l'ensemble de l'application.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                        Oui, supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
=======
>>>>>>> 4ab641b (avoir la possibilité de créer un nouveau service et que celui ci soit re)
      </main>
    </div>
  );
}
