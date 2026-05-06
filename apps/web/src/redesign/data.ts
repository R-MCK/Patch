export interface Plant {
  name: string
  sci: string
  bed: string
  stage: string
  sun: string
  water: number
  days: number
  color: string
  tag: string
  latin: string
  illust: string
}

export const PLANTS: Plant[] = [
  { name: 'Brandywine Tomato', sci: 'Solanum lycopersicum', bed: 'III', stage: 'Flowering', sun: 'full', water: 3, days: 84, color: 'var(--terracotta)', tag: 'TOMATO', latin: 'Solanaceae', illust: 'tomato' },
  { name: 'Sweet Pea', sci: 'Lathyrus odoratus', bed: 'Trellis W', stage: 'Climbing', sun: 'full', water: 2, days: 64, color: 'var(--berry)', tag: 'PEA', latin: 'Fabaceae', illust: 'pea' },
  { name: 'Genovese Basil', sci: 'Ocimum basilicum', bed: 'V', stage: 'Vegetative', sun: 'full', water: 2, days: 28, color: 'var(--moss)', tag: 'BASIL', latin: 'Lamiaceae', illust: 'basil' },
  { name: 'Rainbow Chard', sci: 'Beta vulgaris cicla', bed: 'II', stage: 'Harvesting', sun: 'partial', water: 4, days: 52, color: 'var(--rust)', tag: 'CHARD', latin: 'Amaranthaceae', illust: 'chard' },
  { name: 'English Lavender', sci: 'Lavandula angustifolia', bed: 'Border S', stage: 'Budding', sun: 'full', water: 7, days: 412, color: 'var(--plum)', tag: 'LAVENDER', latin: 'Lamiaceae', illust: 'lavender' },
  { name: 'Curly Kale', sci: 'Brassica oleracea', bed: 'I', stage: 'Vegetative', sun: 'partial', water: 3, days: 38, color: 'var(--forest)', tag: 'KALE', latin: 'Brassicaceae', illust: 'kale' },
  { name: 'Albion Strawberry', sci: 'Fragaria × ananassa', bed: 'IV', stage: 'Fruiting', sun: 'full', water: 2, days: 198, color: 'var(--berry)', tag: 'STRAWBERRY', latin: 'Rosaceae', illust: 'strawberry' },
  { name: 'Detroit Beet', sci: 'Beta vulgaris', bed: 'IV', stage: 'Vegetative', sun: 'full', water: 4, days: 22, color: 'var(--rust)', tag: 'BEET', latin: 'Amaranthaceae', illust: 'beet' },
  { name: 'Sungold Tomato', sci: 'S. lycopersicum', bed: 'III', stage: 'Flowering', sun: 'full', water: 3, days: 84, color: 'var(--honey)', tag: 'TOMATO', latin: 'Solanaceae', illust: 'tomato' },
]
