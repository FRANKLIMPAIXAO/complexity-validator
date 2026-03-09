import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, FileText } from 'lucide-react';
import { ClusterProfile } from '@/types/benchmark';

interface ClusterProfileCardProps {
  profile: ClusterProfile;
}

export default function ClusterProfileCard({ profile }: ClusterProfileCardProps) {
  const getSizeLabel = () => {
    switch (profile.sizeCategory) {
      case 'pequeno':
        return 'Pequeno Porte';
      case 'medio':
        return 'Médio Porte';
      case 'grande':
        return 'Grande Porte';
    }
  };

  const getRegimeLabel = () => {
    switch (profile.predominantRegime) {
      case 'simples':
        return 'Simples Nacional';
      case 'presumido':
        return 'Lucro Presumido';
      case 'real':
        return 'Lucro Real';
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Perfil do Seu Cluster de Comparação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{getSizeLabel()}</span>
            <Badge variant="outline" className="text-xs">
              {profile.sizeCategory === 'pequeno' ? '< 20 clientes' : 
               profile.sizeCategory === 'medio' ? '20-49 clientes' : '50+ clientes'}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{getRegimeLabel()}</span>
            <Badge variant="outline" className="text-xs">Predominante</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {profile.hasTeam ? 'Com Equipe' : 'Individual'}
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          Seus indicadores são comparados com escritórios que possuem perfil semelhante ao seu, 
          garantindo uma análise relevante e contextualizada.
        </p>
      </CardContent>
    </Card>
  );
}
