'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useServiceStore } from '@/hooks/use-service-store';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2 } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom du service doit comporter au moins 2 caractères.",
  }),
});

export default function ServicesPage() {
  const { services, addService } = useServiceStore();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Check for duplicates, ignoring case and spaces
    if (services.some(s => s.name.trim().toLowerCase() === values.name.trim().toLowerCase())) {
        toast({
            variant: "destructive",
            title: "Erreur",
            description: `Le service "${values.name}" existe déjà.`,
        });
        return;
    }
    
    addService(values.name);
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
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent>
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
                           {/* <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                           </Button> */}
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
