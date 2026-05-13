import { TestBed } from '@angular/core/testing';
import { DeliveryService } from './delivery.service';
import { User, Role } from '../models/user.model';
import { DeliveryStatus } from '../models/delivery.model';

describe('DeliveryService', () => {
  let service: DeliveryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DeliveryService]
    });
    service = TestBed.inject(DeliveryService);
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('getDeliveriesForUser', () => {
    const adminUser: User = {
      id: 'u1',
      username: 'admin',
      password: 'admin123',
      role: 'ADMIN' as Role,
      name: 'Admin LogisFlow'
    };

    const driverUser: User = {
      id: 'u2',
      username: 'driver1',
      password: 'driver123',
      role: 'DRIVER' as Role,
      name: 'Carlos Gómez'
    };

    it('debe retornar todas las entregas para ADMIN', () => {
      const deliveries = service.getDeliveriesForUser(adminUser);
      const allDeliveries = service.deliveries();
      expect(deliveries.length).toBe(allDeliveries.length);
    });

    it('debe retornar todas las entregas para ADMIN sin importar el ID', () => {
      const adminWithDifferentId = { ...adminUser, id: 'other-id' };
      const deliveries = service.getDeliveriesForUser(adminWithDifferentId);
      const allDeliveries = service.deliveries();
      expect(deliveries.length).toBe(allDeliveries.length);
    });

    it('debe retornar solo las entregas del conductor para DRIVER', () => {
      const deliveries = service.getDeliveriesForUser(driverUser);
      expect(deliveries.every(d => d.driverId === 'u2')).toBe(true);
    });

    it('debe retornar entregas vacías para conductor sin entregas', () => {
      const emptyDriver: User = {
        id: 'non-existent-driver',
        username: 'empty',
        password: '123',
        role: 'DRIVER' as Role,
        name: 'Empty Driver'
      };
      const deliveries = service.getDeliveriesForUser(emptyDriver);
      expect(deliveries.length).toBe(0);
    });

    it('debe mantener la lista original sin modificar', () => {
      const allDeliveriesBefore = service.deliveries().map(d => ({ ...d }));
      service.getDeliveriesForUser(adminUser);
      const allDeliveriesAfter = service.deliveries();
      expect(allDeliveriesBefore.length).toBe(allDeliveriesAfter.length);
    });
  });

  describe('updateStatus', () => {
    it('debe retornar un Observable', () => {
      const result = service.updateStatus('d1', 'DELIVERED');
      expect(result).toBeDefined();
      expect(typeof result.subscribe).toBe('function');
    });

    it('debe cambiar el estado de la entrega a DELIVERED', (done) => {
      service.updateStatus('d1', 'DELIVERED').subscribe(() => {
        const deliveries = service.deliveries();
        const delivery = deliveries.find(d => d.id === 'd1');
        expect(delivery?.status).toBe('DELIVERED');
        done();
      });
    });

    it('debe cambiar el estado de la entrega a IN_TRANSIT', (done) => {
      service.updateStatus('d2', 'IN_TRANSIT').subscribe(() => {
        const deliveries = service.deliveries();
        const delivery = deliveries.find(d => d.id === 'd2');
        expect(delivery?.status).toBe('IN_TRANSIT');
        done();
      });
    });

    it('debe solo modificar la entrega especificada', (done) => {
      const otherDeliveriesBefore = service.deliveries()
        .filter(d => d.id !== 'd1')
        .map(d => ({ id: d.id, status: d.status }));

      service.updateStatus('d1', 'DELIVERED').subscribe(() => {
        const otherDeliveriesAfter = service.deliveries()
          .filter(d => d.id !== 'd1')
          .map(d => ({ id: d.id, status: d.status }));

        const statusesUnchanged = otherDeliveriesBefore.every((before, index) => {
          return before.status === otherDeliveriesAfter[index].status;
        });
        expect(statusesUnchanged).toBe(true);
        done();
      });
    });

    it('debe manejar estados inválidos sin fallar', (done) => {
      expect(() => {
        service.updateStatus('d1', 'PENDING' as DeliveryStatus).subscribe();
      }).not.toThrow();
      done();
    });
  });

  describe('deliveries signal', () => {
    it('debe ser un readonly signal', () => {
      const deliveries = service.deliveries();
      expect(Array.isArray(deliveries)).toBe(true);
    });

    it('debe contener datos iniciales', () => {
      const deliveries = service.deliveries();
      expect(deliveries.length).toBeGreaterThan(0);
    });

    it('debe contener entregas con estructura correcta', () => {
      const deliveries = service.deliveries();
      const firstDelivery = deliveries[0];
      expect(firstDelivery).toHaveProperty('id');
      expect(firstDelivery).toHaveProperty('packageCode');
      expect(firstDelivery).toHaveProperty('destination');
      expect(firstDelivery).toHaveProperty('driverId');
      expect(firstDelivery).toHaveProperty('status');
      expect(firstDelivery).toHaveProperty('assignedAt');
    });
  });
});