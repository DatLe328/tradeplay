import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/stores/languageStore";

export default function WarrantyPage() {
  const { t } = useTranslation();

  const warrantyPolicies = [
    {
      icon: ShieldCheck,
      title: t('warranty24h'),
      description: t('warranty24hDesc'),
      highlight: true
    },
    {
      icon: RefreshCw,
      title: t('freeExchange'),
      description: t('freeExchangeDesc'),
      highlight: false
    },
    {
      icon: Clock,
      title: t('fastSupport'),
      description: t('fastSupportDesc'),
      highlight: false
    }
  ];

  const coveredCases = [
    t('covered1'),
    t('covered2'),
    t('covered3'),
    t('covered4')
  ];

  const notCoveredCases = [
    t('notCovered1'),
    t('notCovered2'),
    t('notCovered3'),
    t('notCovered4'),
    t('notCovered5')
  ];

  const warrantyProcess = [
    {
      step: 1,
      title: t('processStep1'),
      description: t('processStep1Desc')
    },
    {
      step: 2,
      title: t('processStep2'),
      description: t('processStep2Desc')
    },
    {
      step: 3,
      title: t('processStep3'),
      description: t('processStep3Desc')
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
            <ShieldCheck className="h-3 w-3 mr-1" />
            {t('warrantyHeader')}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-gaming font-bold text-gradient mb-4">
            {t('warrantyTitle')}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('warrantyDesc')}
          </p>
        </motion.div>

        {/* Main Policies */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {warrantyPolicies.map((policy, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full border-2 transition-colors ${
                policy.highlight 
                  ? 'border-primary bg-gradient-to-br from-primary/10 to-[hsl(var(--pastel-blue)/0.2)]' 
                  : 'border-primary/20 hover:border-primary/40'
              }`}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(var(--pastel-blue))] flex items-center justify-center mb-4">
                    <policy.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-gaming">{policy.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Covered vs Not Covered */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full border-2 border-green-500/30 bg-green-500/5">
              <CardHeader>
                <CardTitle className="text-lg font-gaming flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  {t('coveredCases')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {coveredCases.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full border-2 border-red-500/30 bg-red-500/5">
              <CardHeader>
                <CardTitle className="text-lg font-gaming flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  {t('notCoveredCases')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {notCoveredCases.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Warranty Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-primary/20 mb-8">
            <CardHeader>
              <CardTitle className="text-xl font-gaming flex items-center gap-2">
                {t('warrantyProcess')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {warrantyProcess.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-xl font-bold text-primary">{item.step}</span>
                    </div>
                    <h4 className="font-medium mb-2">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {index < warrantyProcess.length - 1 && (
                      <div className="hidden md:block absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-gaming font-bold mb-2 text-yellow-600">{t('importantNotice')}</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li dangerouslySetInnerHTML={{ __html: `• ${t('notice1')}` }} />
                    <li dangerouslySetInnerHTML={{ __html: `• ${t('notice2')}` }} />
                    <li dangerouslySetInnerHTML={{ __html: `• ${t('notice3')}` }} />
                    <li dangerouslySetInnerHTML={{ __html: `• ${t('notice4')}` }} />
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-[hsl(var(--pastel-blue)/0.2)]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-gaming font-bold mb-2">{t('requestWarranty')}</h3>
                  <p className="text-muted-foreground text-sm">
                    {t('requestWarrantyDesc')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {t('support247')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}