import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { PromoFooterComponent } from './promo-footer.component';

describe('PromoFooterComponent', () => {
  let component: PromoFooterComponent;
  let fixture: ComponentFixture<PromoFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoFooterComponent],
      imports: [CommonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PromoFooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should select a promo on init', () => {
    fixture.detectChanges();
    expect(component.selectedPromo).toBeTruthy();
    expect(['instanceiro', 'claudinhos']).toContain(component.selectedPromo.id);
  });

  it('should have exactly 2 promos', () => {
    expect(component.promos.length).toBe(2);
  });

  it('should render the promo title', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const title = el.querySelector('.promo-title');
    expect(title?.textContent).toContain(component.selectedPromo.title);
  });

  it('should render a CTA button only for clickable promos', () => {
    // Trigger ngOnInit first, then override selectedPromo
    fixture.detectChanges();

    // Force Instanceiro (clickable)
    component.selectedPromo = component.promos.find(p => p.id === 'instanceiro')!;
    fixture.detectChanges();
    const cta = fixture.nativeElement.querySelector('.promo-cta');
    expect(cta).toBeTruthy();
    expect(cta.textContent).toContain('Acessar');

    // Force Claudinhos (not clickable)
    component.selectedPromo = component.promos.find(p => p.id === 'claudinhos')!;
    fixture.detectChanges();
    const ctaAfter = fixture.nativeElement.querySelector('.promo-cta');
    expect(ctaAfter).toBeNull();
  });

  it('should wrap clickable promo in an anchor tag with UTM', () => {
    fixture.detectChanges();
    component.selectedPromo = component.promos.find(p => p.id === 'instanceiro')!;
    fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a.promo-clickable');
    expect(link).toBeTruthy();
    expect(link.href).toContain('utm_source=rocalc');
    expect(link.target).toBe('_blank');
  });

  it('should render selo (non-clickable) as div, not anchor', () => {
    fixture.detectChanges();
    component.selectedPromo = component.promos.find(p => p.id === 'claudinhos')!;
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.promo-clickable');
    const div = fixture.nativeElement.querySelector('.promo-row:not(a)');
    expect(link).toBeNull();
    expect(div).toBeTruthy();
  });

  it('should display the label tag only for promos with label', () => {
    // Instanceiro has label
    fixture.detectChanges();
    component.selectedPromo = component.promos.find(p => p.id === 'instanceiro')!;
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('.promo-label');
    expect(label?.textContent?.trim()).toBe('outros projetos da casa');

    // Claudinhos has no label
    component.selectedPromo = component.promos.find(p => p.id === 'claudinhos')!;
    fixture.detectChanges();
    const labelAfter = fixture.nativeElement.querySelector('.promo-label');
    expect(labelAfter).toBeNull();
  });

  it('should not display a copyright baseline (banner is at top, not footer)', () => {
    fixture.detectChanges();
    const baseline = fixture.nativeElement.querySelector('.promo-baseline');
    expect(baseline).toBeNull();
  });
});
