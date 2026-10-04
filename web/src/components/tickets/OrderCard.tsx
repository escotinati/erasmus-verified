import { Badge } from '@/components/ui/Badge';
import type { Order, OrderStatus } from '@/lib/checkout/orders';
import { formatEuros, formatEventDate } from '@/lib/format';
import styles from './OrderCard.module.css';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  cancelled: 'Cancelado',
};

/**
 * Pedido guardado (historial de compra). NO es una entrada: los códigos de acceso llegarán con la
 * integración de Fourvenues. Un pedido simulado se marca como tal para que nadie lo confunda con una compra.
 */
export function OrderCard({ order, headingLevel = 2 }: { order: Order; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const;
  const tickets = order.items.reduce((n, i) => n + i.qty, 0);
  const simulated = order.provider === 'simulated';
  return (
    <article className={styles.card} aria-labelledby={`pedido-${order.id}`}>
      <div className={styles.head}>
        <Heading id={`pedido-${order.id}`} className={styles.name}>
          {order.eventName}
        </Heading>
        <div className={styles.badges}>
          {simulated && <Badge variant="accent">Simulado</Badge>}
          <Badge variant="outline">{STATUS_LABEL[order.status]}</Badge>
        </div>
      </div>
      <p className={styles.meta}>
        Pedido del {formatEventDate(order.createdAt)} · {tickets} {tickets === 1 ? 'entrada' : 'entradas'}
      </p>
      <ul className={styles.lines}>
        {order.items.map((item) => (
          <li key={item.rateId} className={styles.line}>
            <span>
              {item.qty} × {item.rateName}
            </span>
            <span>{formatEuros(item.lineTotalCents)}</span>
          </li>
        ))}
      </ul>
      <dl className={styles.totals}>
        <div className={styles.row}>
          <dt>Gastos de gestión</dt>
          <dd>{formatEuros(order.feesCents)}</dd>
        </div>
        <div className={`${styles.row} ${styles.grand}`}>
          <dt>Total</dt>
          <dd>{formatEuros(order.totalCents)}</dd>
        </div>
      </dl>
    </article>
  );
}
