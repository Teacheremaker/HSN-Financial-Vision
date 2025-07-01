
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useServiceStore, PALETTE_COLORS } from '@/hooks/use-service-store';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du service doit comporter au moins 2 caractères.",
  }),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, { 
    message: "La couleur doit être un code HEX valide (ex: #1a2b3c)." 
  }),
});

export default function ServicesPage() {
  const { services, addService } = useServiceStore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: "#3b82f6",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (services.some(s => s.name.trim().toLowerCase() === values.name.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: `Le service "${values.name}" existe déjà.`,
        });
        return;
    }
    
    addService(values.name, values.color);
    toast({
        title: "Service ajouté",
        description: `Le service "${values.name}" a été créé avec succès.`,
    });
    form.reset();
  }

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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <CardContent className="space-y-6">
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
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
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
                           {/* Delete functionality can be added here later */}
                        </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
