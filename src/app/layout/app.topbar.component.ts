import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../api-services';
import { LayoutService } from './service/app.layout.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
  styleUrls: ['./app.topbar.component.css'],
  providers: [ConfirmationService, MessageService, DialogService],
})
export class AppTopBarComponent implements OnInit, OnDestroy {
  activeItem: MenuItem | undefined;
  items: MenuItem[] = [
    {
      label: 'Calculadora',
      icon: 'pi pi-fw pi-home',
      routerLink: ['/'],
      routerLinkActiveOptions: {
        exact: true,
      },
    },
    {
      label: 'Builds Compartilhadas',
      icon: 'pi pi-fw pi-list',
      routerLink: ['/shared-presets'],
    },
    {
      label: 'Ranking de Itens',
      icon: 'pi pi-fw pi-sort-amount-down',
      routerLink: ['/preset-summary'],
      isNew: true,
    } as any,
  ];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  visible: boolean = false;
  visibleInfo: boolean = false;
  visibleReference = false;
  env = environment;

  infos = [
    'Dados de itens, monstros e skills vêm do "divine-pride"',
    'Mude o tema no botão Config (centro-direita)',
    'Os dados salvos ficam no browser — se limpar os dados do browser, serão apagados',
    'Condições "para cada nível de skill aprendido" requerem definir o nível em "Learn to get bonuses". Se não tiver opção, o bônus aplica no Lv MAX',
    'As opções na linha da arma ficam sempre visíveis — use como "What if"',
    'My Magical Element nas opções = Aumenta dano mágico elemental...',
    'A comparação de arma de 2 mãos ainda não suporta trocar a mão esquerda',
    'Job 61-64, 66-69 podem ter bônus imprecisos por falta de dados',
    'Tab "Summary" = equipamentos, skills e todos os cálculos',
    'Tab "Equipments Summary" = bônus dos itens de forma geral',
    'Tab "Item Descriptions" = bônus de cada item e descrição (para verificar se os bônus estão corretos)',
  ];

  references: { label: string; link: string; writer: string; date?: string; }[] = [
    {
      label: 'Jobs Improvement Bundle Update (20 June 2024)',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/bundleupdate13',
    },
    {
      label: 'Old Headgear & Enchant Improve',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/old-headgear-enchant-improve',
    },
    {
      label: 'New Elemental Table Adjustment',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/new-elemental-table-adjustment',
    },
    {
      label: 'Quarter 1 Class Improvement 2024',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/quarter-1-class-improvement-2024',
    },
    {
      label: 'Bonus JOB LV.70',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/newyear_adventure_2024/assets/img/additional/Ragnarok-Today/POP-UP-Job-BONUS.jpg',
    },
    {
      label: 'Class Improvement [Sura, Warlock, Minstrel&Wanderer]',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/class-improvement-sura-warlock-minstrelwanderer',
    },
    {
      label: 'Skills Balance (1st, 2nd and transcendent classes skills)',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/skills-balance-1st-2nd-and-transcendent-classes-skills',
    },
    {
      label: 'Geffen Magic Tournament Enchant System Update!',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/geffen-magic-tournament-enchant-system-update',
    },
    {
      label: 'Develop note ! Balance Skill ขยายขีดจำกัดเลเวลสูงสุดของ Extended Class',
      writer: 'RO GGT',
      link: 'https://ro.gnjoy.in.th/develop-note-extended',
    },
    {
      label: 'Items & Monsters & Skill infomation',
      writer: 'DIVINE PRIDE',
      link: 'https://www.divine-pride.net/',
    },
    {
      label: 'Skill infomation',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/Main_Page',
    },
    {
      label: 'ATK',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/ATK',
    },
    {
      label: 'MATK',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/MATK',
    },
    {
      label: 'Malangdo Enchants',
      writer: 'IRO Wiki',
      link: 'https://irowiki.org/wiki/Malangdo_Enchants',
    },
    {
      label: 'KRO : Jobs improvement project',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/3723-kro-jobs-improvement-project',
    },
    {
      label: 'KRO : Episode 17.2 enchant info : Automatic equipment and Sin weapons.',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/4176-kro-episode-172-enchant-info-automatic-equipment-and-sin-weapons',
    },
    {
      label: 'KRO : Glast Heim challenge mode enchant',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/3879-kro-glast-heim-challenge-mode-enchant/',
    },
    {
      label: 'KRO : Thanatos Tower revamp',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/4277-kro-thanatos-tower-revamp/',
    },
    {
      label: 'KRO : Illusion of Under Water',
      writer: 'Sigma',
      link: 'https://www.divine-pride.net/forum/index.php?/topic/4319-kro-illusion-of-under-water',
    },
    {
      label: 'RO Podcast EP 7 : ส่อง KRO patchnote Q4 + คุยเรื่อง debuff',
      writer: 'Sigma the fallen',
      link: 'https://www.youtube.com/live/xUiYYi6o6gA?si=EdJvXnchwtionL_4&t=1515',
    },
    {
      label: 'สกิล Class 4 V2',
      writer: 'Sigma the fallen',
      link: 'https://sigmathefallen.blogspot.com/',
    },
    {
      label: 'เจาะลึก Stat ต่างๆ ใน Renewal Part I : Matk & Mdef',
      writer: 'Sigma the fallen',
      link: 'https://web.facebook.com/notes/3202008843255644/',
    },
    {
      label: 'Enchantment System',
      writer: 'Hazy Forest',
      link: 'https://hazyforest.com/equipment:enchantment_system',
    },
    {
      label: 'Enchant Deadly Poison หรือที่เรียกติดปากกันว่า EDP',
      writer: 'Assing',
      link: 'https://www.pingbooster.com/th/blog/detail/ragnarok-online-edp-enchant-deadly-poison-assassin',
    },
    {
      label: 'คุณสมบัติลับยาแอส ทำยังไงให้ตีแรงที่สุด (โปรดเปิดคำบรรยายเพื่อข้อมูลที่ครบถ้วน)',
      writer: '/\\ssing (แอสซิ่ง)',
      link: 'https://youtu.be/WvSbULJ2CGU?si=Ae5vY9teaGZDXSRB',
    },
    {
      label: 'Enchants',
      writer: 'trifectaro.com',
      link: 'https://trifectaro.com/mediawiki/index.php/Enchants',
    },
    {
      label: 'Open-source RO emulator',
      writer: 'rAthena',
      link: 'https://github.com/rathena/rathena',
    },
    // {
    //   label: '',
    //   writer: '',
    //   link: '',
    // },
  ];

  updates: { v: string; date: string; logs: string[]; }[] = [
    {
      v: 'V0.8',
      date: '16-04-2026',
      logs: [
        'Corrigido combos das Memórias de Edda Biolab (nomes de armas estavam errados, combos não ativavam)',
        'Corrigido skills erradas nas Memórias de Eremes, Cecil, Gertie, Randel e Chen',
        'Adicionadas skills faltantes na Memória de Chen (Combo Quádruplo, O Último Dragão, Soco Furacão, etc.)',
        'Corrigido Carta Cavaleiro Branco Mutante aparecendo no slot de manto ao invés de arma',
        'Corrigido 12 pedras de costume invisíveis nos dropdowns (Músicos II, Lorde II, Criador II, Cavaleiro Rúnico II)',
        'Corrigido skills das pedras Artistas II (Flecha Melódica ao invés de Vulcão de Flechas)',
        'Corrigido bônus de dano a distância que não funcionavam em 24 itens',
        'Corrigido Estilingue faltando no Wanderer e encantamento Artistas II (Meio)',
        'Corrigido bônus de refino da Carta Porcellio Albino que aplicava fora do combo',
      ],
    },
    {
      v: 'V0.7',
      date: '16-04-2026',
      logs: [
        'Atualização de itens (patch Abril 2026)',
        'Corrigido condições de combo de cartas do EP17.2',
        'Corrigido escalonamento de cartas do evento Gatchaman',
        'Corrigido enchants de memória Edda Biolab',
        'Corrigido classificação errada de 12 itens (bota/manto trocados)',
        'Removida skill duplicada Criar Monstro Planta do Genetic',
      ],
    },
    {
      v: 'V0.6',
      date: '05-04-2026',
      logs: [
        'Corrigido dropdown de enchants resetando valor ao recarregar página',
        'Corrigido referências de skills erradas em 17 cartas do EP17.2',
        'Adicionadas 4 cartas faltantes do EP17.2',
      ],
    },
    {
      v: 'V0.5',
      date: '01-04-2026',
      logs: [
        'Nomes de skills agora aparecem em PT-BR',
        'Atualização de itens (patch 31/03)',
      ],
    },
    {
      v: 'V0.4',
      date: '25-03-2026',
      logs: [
        'Adicionada seleção de elemento para Tetra Vortex Released (Warlock)',
        'Adicionada comparação de tempo de batalha (mostrando hits/seg com decimal)',
        'Corrigido itens de ArchBishop inacessíveis',
      ],
    },
    {
      v: 'V0.3',
      date: '16-03-2026',
      logs: [
        'Redesign da seção de simulação — DPS em destaque, detalhes em accordion',
        'Adicionado cálculo de proc de Giant Growth (Turisus) no ataque básico',
        'Autocast integrado nas seções de skill e ataque básico',
        'Adicionado toggle para ativar/desativar buffs, skills ativas e consumíveis',
        'Adicionados 16 monstros da Thanatos Tower + Boitata',
        'Corrigido Instinto, Epifania e Jitterbug não limpavam bônus ao desativar chance',
      ],
    },
    {
      v: 'V0.2',
      date: '14-03-2026',
      logs: [
        'Adicionado breakdown de stats — clique no +N dos stats base para ver detalhes',
        'Adicionado breakdown de dano (skill, básico, crítico) passo a passo',
        'Breakdowns para ATK, MATK, DEF, MDEF, HIT, FLEE, ASPD, CRI e mais',
        'Separação de bônus de elemento: vs elemento do monstro vs elemento de ataque',
        'Adicionados 58 novos itens e 597 renomeações',
        'Adicionados bônus de set para 5 novos anéis de classe (combos Arma Primordial)',
        'Corrigido scripts de equipamentos shadow (Bafo/Sopro Dragão, etc.)',
        'Corrigido pedras de costume Sicário II / Algoz II',
      ],
    },
    {
      v: 'V0.1',
      date: '08-03-2026',
      logs: [
        'Adicionado sistema de precast (sequência de skills antes do ciclo principal)',
        'Adicionado Released skills para Warlock com precast sequence',
        'Adicionado resumo de ciclo de precast e dropdown de repetições na UI',
        'Corrigido enchant ASPD do módulo 17.2 (dava ACD ao invés de velocidade)',
        'Corrigido bônus de set do Grande Manto dos Esquecidos [1]',
        'Corrigido classificação errada de bota/manto em 265 itens',
      ],
    },
  ];
  localVersion = localStorage.getItem('version') || '';
  lastestVersion = this.updates[0].v;

  unreadVersion = this.updates.findIndex((a) => a.v === this.localVersion);
  showUnreadVersion = this.unreadVersion === -1 ? this.updates.length + 1 : this.unreadVersion;

  visibleUpdate = false;

  username: string;

  obs = [] as Subscription[];

  constructor(
    public layoutService: LayoutService,
    private readonly authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnDestroy(): void {
    for (const subscription of this.obs) {
      subscription?.unsubscribe();
    }
  }

  ngOnInit(): void {
    const o = this.authService.profileEventObs$.subscribe((profile) => {
      this.username = profile?.name;
    });
    this.obs.push(o);
  }

  login() {
    this.authService.signInWithGoogle();
  }

  logout() {
    this.waitConfirm('Logout ?').then((isConfirm) => {
      if (!isConfirm) return;

      this.authService.logout();
      this.messageService.add({
        severity: 'success',
        summary: 'Logout',
      });
    });
  }

  showDialog() {
    this.visible = true;
  }

  showUpdateDialog() {
    this.visibleUpdate = true;
  }

  showReferenceDialog() {
    this.visibleReference = true;
  }

  onHideUpdateDialog() {
    // localStorage.setItem('version', this.updates[0].v);
    // this.showUnreadVersion = 0;
  }

  onReadUpdateClick(version: string) {
    localStorage.setItem('version', version);
    this.unreadVersion = this.updates.findIndex((a) => a.v === version);
    this.showUnreadVersion = this.unreadVersion === -1 ? this.updates.length + 1 : this.unreadVersion;
  }

  showInfoDialog() {
    this.visibleInfo = true;
  }

  showMyProfile() {
    this.layoutService.showMyProfileSidebar();
  }

  private waitConfirm(message: string, icon?: string) {
    return new Promise((res) => {
      this.confirmationService.confirm({
        message: message,
        header: 'Confirmation',
        icon: icon || 'pi pi-exclamation-triangle',
        accept: () => {
          res(true);
        },
        reject: () => {
          console.log('reject confirm');
          res(false);
        },
      });
    });
  }
}
