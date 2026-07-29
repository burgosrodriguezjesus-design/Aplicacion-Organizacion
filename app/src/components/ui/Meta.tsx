import { PRIORITY_META, type Priority } from '../../types';
import { useStore } from '../../store/store';
import { Badge } from './Badge';

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return (
    <Badge className="bg-transparent px-0 text-[11px]" style={{ color: m.color }}>
      {m.emoji} {m.label}
    </Badge>
  );
}

export function CategoryChip({ categoryId }: { categoryId?: string }) {
  const category = useStore((s) => s.categories.find((c) => c.id === categoryId));
  if (!category) return null;
  return (
    <Badge style={{ backgroundColor: `${category.color}1a`, color: category.color }}>
      {category.icon} {category.name}
    </Badge>
  );
}
