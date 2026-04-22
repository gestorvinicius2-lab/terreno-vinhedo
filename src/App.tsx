import React, { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "motion/react";
import useEmblaCarousel from 'embla-carousel-react';
import { 
  MapPin, 
  Maximize2, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  MessageSquare,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "./lib/utils";

// Form Schema
const leadSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  phone: z.string().min(10, "Informe um telefone válido com DDD"),
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const waUrl = `https://wa.me/5519982347653?text=${encodeURIComponent('Olá, gostaria de saber mais sobre o terreno.')}`;
    
    // Tenta abrir o WhatsApp em uma nova aba instantaneamente (evita bloqueadores de pop-up e erros de iframe)
    const newWindow = window.open(waUrl, "_blank", "noopener,noreferrer");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        keepalive: true, // Garante que a requisição termine mesmo se a página fechar
      });

      if (response.ok) {
        // Sucesso silencioso no backend
      } else {
        console.warn("Aviso: Falha ao salvar no banco de dados. O lead não foi registrado na planilha.");
      }
      
    } catch (error) {
      console.error("Error submitting lead:", error);
    } finally {
      setIsSubmitting(false);
      setSubmitStatus("success");
      reset();
      
      // Fallback: Se a nova janela foi bloqueada pelo navegador, força a navegação
      if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
         window.top ? window.top.location.href = waUrl : window.location.href = waUrl;
      }
    }
  };

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  // Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    breakpoints: {
      '(min-width: 768px)': { active: false } // Disable carousel on desktop
    }
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="min-h-screen selection:bg-gold/30">
      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src="https://i.postimg.cc/4d4Y0f7F/1775844731818.jpg" 
            alt="Terreno em Vinhedo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-transparent to-ink" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-4 py-1 mb-6 border border-gold/50 rounded-full text-xs font-semibold tracking-[0.2em] uppercase text-gold"
          >
            Oportunidade para Investidores em Vinhedo/SP
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif mb-8 leading-[1.1] max-w-5xl mx-auto"
          >
            Terreno Premium no Centro com Retorno de <span className="italic text-gold">1,6% ao Mês</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-paper/80 max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          >
            Avaliado em R$ 1.300.000, disponível por apenas <strong className="text-paper font-semibold">R$ 790.000</strong>. 
            Compre abaixo do valor de mercado e lucre com a alta demanda por locação na região da Av. 9 de Julho.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              onClick={scrollToForm}
              className="bg-gold hover:bg-gold-dark text-ink px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 group"
            >
              <MessageSquare className="w-5 h-5" />
              Quero Conhecer os Detalhes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-paper/30"
        >
          <div className="w-px h-12 bg-gradient-to-b from-paper/50 to-transparent mx-auto" />
        </motion.div>
      </header>

      {/* Problem & Opportunity */}
      <section className="py-24 bg-paper">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl leading-tight">
                Por que este é o negócio mais <span className="italic">inteligente</span> de Vinhedo hoje?
              </h2>
              <div className="space-y-6 text-lg text-ink/70 font-light leading-relaxed">
                <p>
                  O Centro de Vinhedo é uma região altamente valorizada, mas sofre com uma carência clara: 
                  <strong className="text-ink font-medium"> faltam opções de moradia acessível e compacta</strong>.
                </p>
                <p>
                  Profissionais, estudantes e solteiros buscam a conveniência de morar a poucos passos da Avenida 9 de Julho, 
                  mas a oferta é escassa.
                </p>
                <div className="p-6 bg-gold/5 border-l-4 border-gold rounded-r-xl">
                  <p className="text-ink italic font-medium">
                    A Solução: Um projeto de construção de kitnets ou estúdios. 
                    Alta rotatividade, baixa vacância e o melhor metro quadrado da cidade.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1582408921715-18e7806367c1?auto=format&fit=crop&q=80&w=1000" 
                alt="Investimento Imobiliário" 
                className="rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl hidden md:block">
                <div className="flex items-center gap-4 mb-2">
                  <TrendingUp className="text-gold w-8 h-8" />
                  <span className="text-3xl font-serif font-bold">ROI 1,6%</span>
                </div>
                <p className="text-sm text-ink/50 uppercase tracking-wider">Projeção Mensal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="py-24 bg-ink text-paper">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">O que você está adquirindo</h2>
            <p className="text-paper/50 font-light">Ativos reais com valorização imediata</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: "Localização Estratégica",
                desc: "A poucos metros da Avenida 9 de Julho, o coração econômico de Vinhedo."
              },
              {
                icon: Maximize2,
                title: "Área Total: 260 m²",
                desc: "Terreno plano e pronto para construir nos fundos, otimizando custos de obra."
              },
              {
                icon: Building2,
                title: "Renda Imediata",
                desc: "Inclui uma sala comercial de 21 m² já construída, pronta para alugar."
              }
            ].map((item, i) => (
              <div key={i} className="p-10 border border-paper/10 rounded-3xl hover:border-gold/50 transition-colors group">
                <item.icon className="w-12 h-12 text-gold mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl mb-4">{item.title}</h3>
                <p className="text-paper/60 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="py-24 bg-paper">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Galeria do Imóvel</h2>
            <p className="text-ink/50 font-light">Imagens reais da localização e potencial do terreno</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "https://i.postimg.cc/W4QcCSHX/Whats-App-Image-2026-04-01-at-16-28-11-(4).jpg",
              "https://i.postimg.cc/vTT7nLG3/Whats-App-Image-2026-04-01-at-16-28-11-(6).jpg",
              "https://i.postimg.cc/sgt13PBL/imagem-1080x1080.jpg"
            ].map((src, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="aspect-square overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all group"
              >
                <img 
                  src={src} 
                  alt={`Foto do terreno ${i + 1}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Math of Profit */}
      <section className="py-24 bg-paper overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="text-left">
              <h2 className="text-4xl md:text-5xl mb-4">A Matemática do Lucro</h2>
              <p className="text-ink/50 font-light">Transparência total nos números do seu investimento</p>
            </div>
            
            {/* Carousel Controls (Mobile Only) */}
            <div className="flex gap-2 md:hidden">
              <button 
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center hover:bg-ink hover:text-paper transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className="w-12 h-12 rounded-full border border-ink/10 flex items-center justify-center hover:bg-ink hover:text-paper transition-all disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-hidden md:overflow-visible" ref={emblaRef}>
            <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8">
              {/* Card 1 */}
              <div className="flex-[0_0_85%] min-w-0 md:flex-none bg-white p-8 rounded-3xl shadow-sm border border-ink/5 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp className="text-gold w-6 h-6" />
                  </div>
                  <h3 className="text-2xl mb-6">O Desconto</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center pb-4 border-bottom border-ink/5">
                      <span className="text-ink/50">Avaliação</span>
                      <span className="line-through text-ink/40">R$ 1.300.000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-ink/50">Valor Atual</span>
                      <span className="text-2xl font-bold text-gold">R$ 790.000</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Ganho imediato de R$ 510.000 na compra
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex-[0_0_85%] min-w-0 md:flex-none bg-white p-8 rounded-3xl shadow-sm border border-ink/5 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center mb-6">
                    <Building2 className="text-gold w-6 h-6" />
                  </div>
                  <h3 className="text-2xl mb-6">O Projeto</h3>
                  <p className="text-ink/60 font-light mb-6">
                    Espaço perfeito para construção de até 8 unidades residenciais compactas nos fundos do lote.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-ink/50">Investimento Obra</span>
                    <span className="font-semibold">R$ 500.000</span>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-ink/5 text-ink/70 rounded-xl text-sm italic">
                  * Estimativa baseada em padrão de acabamento econômico/médio.
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex-[0_0_85%] min-w-0 md:flex-none bg-gold text-ink p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-ink/10 rounded-2xl flex items-center justify-center mb-6">
                    <TrendingUp className="text-ink w-6 h-6" />
                  </div>
                  <h3 className="text-2xl mb-6">O Retorno (ROI)</h3>
                  <div className="text-5xl font-serif font-bold mb-2">1,6% <span className="text-2xl">/mês</span></div>
                  <p className="text-ink/70 font-light mb-8">
                    Projeção de rentabilidade unindo a sala comercial frontal e as 8 unidades residenciais.
                  </p>
                </div>
                <div className="p-4 bg-ink/10 rounded-xl text-sm font-medium">
                  100% de ocupação estimada pela alta demanda local.
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Dots (Mobile Only) */}
          <div className="flex justify-center gap-2 mt-8 md:hidden">
            {[0, 1, 2].map((index) => (
              <div 
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  selectedIndex === index ? "bg-gold w-6" : "bg-ink/10"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lead Capture Form */}
      <section id="lead-form" className="py-24 bg-ink text-paper relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 -skew-x-12 translate-x-1/2" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl mb-8 leading-tight">
                Não deixe essa <span className="italic text-gold">oportunidade</span> passar.
              </h2>
              <p className="text-paper/60 text-lg font-light mb-8">
                Imóveis centrais com essa margem de deságio e estudo de viabilidade claro não ficam muito tempo disponíveis. 
                Esta é uma oportunidade de repasse direto.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-paper/80">
                  <CheckCircle2 className="text-gold w-5 h-5" />
                  <span>Atendimento direto com o proprietário</span>
                </div>
                <div className="flex items-center gap-3 text-paper/80">
                  <CheckCircle2 className="text-gold w-5 h-5" />
                  <span>Documentação 100% regularizada</span>
                </div>
                <div className="flex items-center gap-3 text-paper/80">
                  <CheckCircle2 className="text-gold w-5 h-5" />
                  <span>Estudo de viabilidade completo disponível</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl text-ink">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ink/60 mb-2">Nome Completo</label>
                  <input 
                    {...register("name")}
                    type="text" 
                    placeholder="Seu nome"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border border-ink/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all",
                      errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink/60 mb-2">WhatsApp / Telefone</label>
                  <input 
                    {...register("phone")}
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    className={cn(
                      "w-full px-4 py-3 rounded-xl border border-ink/10 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all",
                      errors.phone && "border-red-500 focus:border-red-500 focus:ring-red-500"
                    )}
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phone.message}</p>}
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-ink text-paper py-4 rounded-xl font-bold hover:bg-ink/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      Falar com o proprietário
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {submitStatus === "success" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-green-50 text-green-700 rounded-xl text-sm font-medium text-center"
                    >
                      Tudo certo! Você está sendo redirecionado para o WhatsApp...
                    </motion.div>
                  )}
                  {submitStatus === "error" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium text-center shadow-lg border border-red-100"
                    >
                      Ocorreu um erro. Tente novamente ou use o WhatsApp.
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-paper border-t border-ink/5">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-serif mb-2">Terreno Premium Vinhedo</h4>
              <p className="text-sm text-ink/50">Oportunidade exclusiva para investidores qualificados.</p>
            </div>
            <div className="text-center md:text-right text-xs text-ink/40 max-w-md">
              <p>
                * Os valores de obra e retorno são projeções estimadas e podem variar de acordo com o padrão de acabamento e gestão da locação. 
                Consulte o estudo de viabilidade completo.
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-ink/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-ink/30 font-bold">
            <p>© 2026 - Todos os direitos reservados</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gold transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-gold transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
