///Parent class for turrets
///type provides type of turret, which should contain 'damage', 'firingSpeed', and 'bulletSpeed'
class Turret {
    constructor(type, damage, cooldown, accuracy, range, price) {
        this.type = type;

        this.damage = damage;
        this.cooldown;
        this.accuracy;
        this.range;

        this.baseCooldown = cooldown;
        this.baseAccuracy = accuracy;
        this.baseRange = range;

        this.shotTimer = 0;
        this.canShoot = true;
        this.atributesUpdated = false;
        this.angle = 0;
        this.actualAngle = 0;
        this.offset = 0;
        this.price = price;
    }
    static standardTurret() {
        //Low Damage - Medium Fire Rate - Low Radius
        return new Turret("STANDARD", 1, 20, 1, 60, 10);
    }
    static sniperTurret() {
        //High Damage - Low Fire Rate - High Radius
        return new Turret("SNIPER", 2, 40, 1, 160, 50);
    }
    static machineGunTurret() {
        //Low Damage - High Fire Rate - Medium Radius
        return new Turret("MACHINE_GUN", 1, 6, 0.8, 80, 100);
    }
    static laserTurret() {
        //High Damage - High Fire Rate - High Radius
        return new Turret("LASER", 2, 10, 0.9, 100, 200);
    }
}