# Design: Equipamentos Edda de Biolaboratório

**Data**: 2026-03-03
**Status**: Aprovado

## Escopo

Adicionar **66 itens** da instância Edda de Biolaboratório ao calculador:
- **41 armas** (14 classes, 2-3 por classe, level 4, req 170, 2 slots)
- **12 diademas/coroas** (headgears upper, DEF 10, req 170, 1 slot)
- **13 enchants de memória** (cards com bônus por arma específica)

## Fonte de Dados

- **Referência principal**: [browiki.org/wiki/Edda_do_Biolaboratório](https://browiki.org/wiki/Edda_do_Biolaborat%C3%B3rio)
- **Stats detalhados**: Divine Pride API (`divine-pride.net/database/item/{id}`)
- **Nomes**: PT-BR para itens já no LATAM (da wiki), English do Divine Pride para itens não disponíveis

## Lista de Itens

### Armas por Classe

| Classe | ID | Nome | Tipo Arma |
|---|---|---|---|
| **Rune Knight** | 21051 | Volar [2] | Two-handed Sword |
| | 21052 | Vernan [2] | Two-handed Sword |
| | 32023 | Argen Blanco [2] | Two-handed Spear |
| **Royal Guard** | 32024 | Harve [2] | Spear |
| | 32025 | Fortridge [2] | Spear |
| | 32350 | Farthezan [2] | Mace |
| **Warlock** | 2055 | Bastão Milagroso [2] | Two-handed Staff |
| | 2056 | Gravitação [2] | Two-handed Staff |
| | 26158 | Varinha de Rosas Cálidas [2] | Rod |
| **Sorcerer** | 28633 | Lançarin [2] | Rod |
| | 26160 | Castigo Diamante [2] | Rod |
| | 26159 | Lança Psíquica [2] | Rod |
| **Mechanic** | 16092 | Bate-Estacas Motorizado [2] | Mace |
| | 1333 | Ferramenta Dourada [2] | Mace |
| | 28138 | Chave Maxi [2] | Mace |
| **Geneticist** | 16094 | Caduceu [2] | Mace |
| | 16093 | Injetor Acoplável [2] | Mace |
| | 32351 | Estal [2] | Mace |
| **Archbishop** | 2057 | Adorare [2] | Two-handed Staff |
| | 26161 | Penitência [2] | Mace |
| | 16095 | Mangual Lucis [2] | Mace |
| **Shura** | 1865 | Cólera do Dragão [2] | Knuckle |
| | 1866 | Bandagens Divinas [2] | Knuckle |
| | 16096 | Pendulum [2] | Knuckle |
| **Ranger** | 18185 | Estrela Afiada [2] | Bow |
| | 18186 | Arco Certeiro [2] | Bow |
| | 18187 | Tiro Rapina [2] | Bow |
| **Wanderer** | 26213 | Fita Fru-Fru [2] | Whip |
| | 26212 | Chibata Coração [2] | Whip |
| | 18188 | Ventania [2] | Bow |
| **Minstrel** | 32108 | Viola [2] | Musical Instrument |
| | 32107 | Banjo Negro [2] | Musical Instrument |
| **Shadow Chaser** | 18184 | Triarco [2] | Bow |
| | 28767 | Estripadora [2] | Dagger |
| | 28768 | Adaga Platina [2] | Dagger |
| **Guillotine Cross** | 28765 | Navalha Carrasca [2] | Dagger |
| | 28042 | Ceifo Cruzado [2] | Katar |
| | 28044 | Agudo Filo [2] | Katar |
| | 28766 | Navalha Repente [2] | Dagger |

### Diademas/Coroas (Headgears)

| ID | Nome | Classe |
|---|---|---|
| 400078 | Biolab Aries Crown [1] | Rune Knight |
| 400079 | Biolab Libra Diadem [1] | Royal Guard |
| 400094 | Biolab Aquarius Crown [1] | Warlock |
| 400095 | Biolab Aquarius Diadem [1] | Sorcerer |
| 400098 | Biolab Taurus Crown [1] | Mechanic |
| 400099 | Biolab Taurus Diadem [1] | Geneticist |
| 400116 | Biolab Virgo Diadem [1] | Ranger |
| 400117 | Biolab Libra Crown [1] | Archbishop |
| 400118 | Biolab Cancer Diadem [1] | Shura |
| 400119 | Biolab Lion Crown [1] | Shadow Chaser |
| 400120 | Biolab Capricorn Crown [1] | Minstrel/Wanderer |
| 400121 | Biolab Gemini Crown [1] | Guillotine Cross |

### Enchants de Memória (Cards)

| ID | Nome | Classe |
|---|---|---|
| 29594 | Seyren's Memory | Rune Knight |
| 29595 | Howard's Memory | Mechanic |
| 29596 | Eremes's Memory | Guillotine Cross |
| 29598 | Kathryne's Memory | Warlock |
| 29599 | Margaretha's Memory | Archbishop |
| 29600 | Cecil's Memory | Ranger |
| 29601 | Randel's Memory | Royal Guard |
| 29602 | Flamel's Memory | Geneticist |
| 29603 | Gertie's Memory | Sorcerer |
| 29604 | Celia's Memory | Wanderer |
| 29605 | Chen's Memory | Shura |
| 29606 | Trentini's Memory | Shadow Chaser |
| 29607 | Alphoccio's Memory | Minstrel |

## Padrão de Scripts

### Armas — Exemplo: Volar (21051)
```json
{
  "id": 21051,
  "aegisName": "Volar",
  "name": "Volar [2]",
  "unidName": "Two-handed Sword",
  "resName": "Volar",
  "slots": 2,
  "itemTypeId": 1,
  "itemSubTypeId": 258,
  "itemLevel": 4,
  "attack": 280,
  "weight": 280,
  "requiredLevel": 170,
  "usableClass": ["RuneKnight"],
  "script": {
    "Bowling Bash": ["30"],
    "atk": ["1---4"],
    "cd__Ignition Break": ["9===1"],
    "cd__Bowling Bash": ["9===1"],
    "Bowling Bash": ["30", "11===20"]
  }
}
```

### Padrão de Script Keys

| Descrição do Divine Pride | Script Key | Formato |
|---|---|---|
| ATK +X flat | `atk` | `"X"` |
| MATK +X flat | `matk` | `"X"` |
| ATK +X per refine level | `atk` | `"1---X"` |
| MATK +X per refine level | `matk` | `"1---X"` |
| ATK +X per 2 refine levels | `atk` | `"2---X"` |
| MATK +X% per 2 refine levels | `matkPercent` | `"2---X"` |
| Skill damage +X% | `"SkillName"` | `"X"` |
| Skill +X% at refine 9+ | `"SkillName"` | `"9===X"` |
| CRI +X | `cri` | `"X"` |
| Critical damage +X% | `criDmg` | `"X"` |
| Critical damage +X% per refine | `criDmg` | `"1---X"` |
| Long-ranged physical +X% | `lDmg` | `"X"` |
| Ghost magic +X% | `m_my_element_ghost` | `"X"` |
| ASPD +X% | `aspdPercent` | `"X"` |
| Cooldown -X sec | `cd__SkillName` | `"X"` |
| VCT -X% | `vct` | `"X"` |
| FCT -X sec | `fct` | `"X"` |
| All size phys/mag +X% | `p_size_all` / `m_size_all` | `"X"` |

### Diademas — Exemplo: Biolab Libra Diadem (400079)
```json
{
  "id": 400079,
  "aegisName": "Biolab_Libra_Diadem",
  "name": "Biolab Libra Diadem [1]",
  "unidName": "Headgear",
  "slots": 1,
  "itemTypeId": 2,
  "itemSubTypeId": 0,
  "itemLevel": 1,
  "defense": 10,
  "weight": 10,
  "requiredLevel": 170,
  "compositionPos": 256,
  "usableClass": ["RoyalGuard"],
  "script": {
    "atk": ["2---20"],
    "matk": ["2---20"],
    "aspdPercent": ["7===10"],
    "atkPercent": ["9===15"],
    "m_my_element_holy": ["9===15"],
    "p_size_all": ["11===10"],
    "m_size_all": ["11===10"],
    "fct": ["11===0.2"],
    "vct": ["EQUIP[Farthezan]===10"],
    "Gloria Domini": ["EQUIP[Farthezan]REFINE[weapon==1]---10"],
    "Genesis Ray": ["EQUIP[Farthezan]REFINE[weapon==1]---10"],
    "cd__Shield Press": ["EQUIP[Harve]===1"],
    "Shield Press": ["EQUIP[Harve]REFINE[weapon==1]---10"],
    "cd__Cannon Spear": ["EQUIP[Fortridge]===0.5"],
    "Cannon Spear": ["EQUIP[Fortridge]REFINE[weapon==1]---12"]
  }
}
```

### Memory Enchants — Exemplo: Seyren's Memory (29594)
```json
{
  "id": 29594,
  "aegisName": "Seyrens_Memory",
  "name": "Seyren's Memory",
  "unidName": "Card",
  "slots": 0,
  "itemTypeId": 6,
  "weight": 0,
  "requiredLevel": 1,
  "compositionPos": 2,
  "usableClass": ["RuneKnight"],
  "script": {
    "Bowling Bash": ["EQUIP[Volar]3---10"],
    "Ignition Break": ["EQUIP[Volar]3---5"],
    "Clashing Spiral": ["EQUIP[Vernan]3---10"],
    "Sonic Wave": ["EQUIP[Vernan]3---5"],
    "Brandish Spear": ["EQUIP[Argen Blanco]3---10"],
    "Hundred Spears": ["EQUIP[Argen Blanco]3---5"]
  }
}
```

## Abordagem Técnica

### 1. Script de Importação (`scripts/add-edda-biolab.mjs`)

- Recebe lista de IDs dos 66 itens
- Busca stats base via Divine Pride API para cada item
- Gera JSON com estrutura correta (`itemTypeId`, `itemSubTypeId`, `compositionPos`, etc.)
- Scripts de bônus serão mapeados manualmente após importação dos stats base

### 2. Mapeamento de Skills

Necessário mapear nomes de skills do Divine Pride para os constants do calculador (`src/app/constants/skill-name.ts`). Exemplos:
- "Bowling Bash" → verificar se existe como `Bowling Bash` ou nome PT-BR
- "Shield Press" → verificar constant
- "Soul Strike" → verificar constant

### 3. Merge no item.json

- Adicionar os 66 itens ao arquivo `src/assets/demo/data/item.json`
- Manter ordenação por ID

### 4. Validação

- `npm test` — sem regressões
- Browser: selecionar cada classe, verificar que armas/headgears aparecem nos dropdowns
- Verificar que set bonuses funcionam (equipar diadema + arma da mesma classe)

## Itens NÃO no Escopo

- Armaduras, garments, shoes, acessórios da Edda Biolab
- Enchants de combate (non-memory enchants como Mira Apurada, Fatal, etc.)
- Monstros da instância
