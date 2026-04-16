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
  promos: PromoItem[] = [
    {
      id: 'instanceiro',
      title: 'Instanceiro',
      description: 'Trackeie o cooldown das suas instâncias e o respawn dos MVPs do RO LATAM em tempo real.',
      logoSrc: 'assets/images/promo/instanceiro.svg',
      ctaLabel: 'Acessar →',
      ctaUrl: 'https://instanceiro.vercel.app?utm_source=rocalc&utm_medium=promo-footer',
      label: 'outros projetos da casa',
      bgGradient: 'linear-gradient(90deg, rgba(200,121,65,0.08) 0%, rgba(232,166,101,0.04) 100%)',
      titleColor: '#E8A665',
      isClickable: true,
    },
    {
      id: 'claudinhos',
      title: 'Guilda Claudinhos',
      description: 'Este projeto é um oferecimento da Guilda Claudinhos para a comunidade RO LATAM — servidor Nidhogg.',
      logoSrc: 'assets/images/promo/claudinhos.png',
      bgGradient: 'linear-gradient(90deg, rgba(168,85,247,0.10) 0%, rgba(250,204,21,0.04) 100%)',
      titleColor: '#FACC15',
      isClickable: false,
    },
  ];

  selectedPromo: PromoItem;

  ngOnInit(): void {
    this.selectedPromo = this.promos[Math.floor(Math.random() * this.promos.length)];
  }
}
