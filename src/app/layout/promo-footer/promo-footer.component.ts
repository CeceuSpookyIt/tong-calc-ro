import { Component, OnInit } from '@angular/core';

interface PromoItem {
  id: string;
  title: string;
  description: string;
  logoSrc: string;
  ctaLabel?: string;
  ctaUrl?: string;
  label?: string;
  bgGradient: string;
  titleColor: string;
  isClickable: boolean;
}

@Component({
  selector: 'app-promo-footer',
  templateUrl: './promo-footer.component.html',
  styleUrls: ['./promo-footer.component.css'],
})
export class PromoFooterComponent implements OnInit {
  private instanceiroDescriptions: string[] = [
    'Nunca mais perca MVP por esquecer o horário. A gente controla pra você.',
    'Chega de perder instância porque esqueceu o CD. Tá tudo aqui.',
    'O NPC não te deixou entrar na instância? Controle seus timers e nunca mais passe por isso.',
    'MVP nasceu e você nem sabia? Com o Instanceiro isso não acontece mais.',
    'Controle o CD das suas instâncias e saiba a hora exata que o MVP volta.',
    'Para de anotar timer de instância no bloco de notas. Deixa isso com a gente.',
    'Aquele MVP que você tá de olho? A gente avisa quando ele nascer.',
    'Todas as suas instâncias e MVPs organizadinhos num lugar só.',
    'Não precisa ficar perguntando no grupo quando o MVP nasce. Tá tudo aqui.',
    'Timer de instância e respawn de MVP do LATAM. Simples assim.',
  ];

  private instanceiroBase: PromoItem = {
    id: 'instanceiro',
    title: 'Instanceiro',
    description: '',
    logoSrc: 'assets/images/promo/instanceiro.svg',
    ctaLabel: 'Acessar →',
    ctaUrl: 'https://instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer',
    label: 'outros projetos da casa',
    bgGradient: 'linear-gradient(90deg, rgba(200,121,65,0.08) 0%, rgba(232,166,101,0.04) 100%)',
    titleColor: '#E8A665',
    isClickable: true,
  };

  private claudinhos: PromoItem = {
    id: 'claudinhos',
    title: 'Guilda Claudinhos',
    description: 'Este projeto é um oferecimento da Guilda Claudinhos para a comunidade RO LATAM — servidor Nidhogg.',
    logoSrc: 'assets/images/promo/claudinhos.png',
    ctaLabel: 'Conheça →',
    ctaUrl: 'https://claudinhos.org?utm_source=rocalc&utm_medium=promo-footer',
    bgGradient: 'linear-gradient(90deg, rgba(168,85,247,0.10) 0%, rgba(250,204,21,0.04) 100%)',
    titleColor: '#FACC15',
    isClickable: true,
  };

  selectedPromo: PromoItem;

  ngOnInit(): void {
    const showClaudinhos = Math.random() < 0.5;
    if (showClaudinhos) {
      this.selectedPromo = this.claudinhos;
    } else {
      const desc = this.instanceiroDescriptions[Math.floor(Math.random() * this.instanceiroDescriptions.length)];
      this.selectedPromo = { ...this.instanceiroBase, description: desc };
    }
  }
}
