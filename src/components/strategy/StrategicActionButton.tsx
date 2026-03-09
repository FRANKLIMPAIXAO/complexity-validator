import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StrategicIntegrationWizard from '@/components/strategy/StrategicIntegrationWizard';
import type { Client } from '@/types/database';

interface StrategicActionButtonProps {
  client: Client;
  isRiskClient: boolean;
}

export default function StrategicActionButton({ client, isRiskClient }: StrategicActionButtonProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Check if client qualifies for strategic action
  const qualifies = 
    client.is_underpriced || 
    isRiskClient || 
    client.complexity_score >= 30;

  if (!qualifies) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    Planejamento Orientado por Dados
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Este cliente foi identificado como oportunidade estratégica.
                    Transforme este diagnóstico em objetivo, metas e KPIs automaticamente.
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => setIsWizardOpen(true)}
                className="shrink-0"
              >
                <Target className="h-4 w-4 mr-2" />
                Transformar em Objetivo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <StrategicIntegrationWizard
        client={client}
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </>
  );
}
