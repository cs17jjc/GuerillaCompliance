///Parent class for turrets
///type provides type of turret, which should contain 'damage', 'firingSpeed', and 'bulletSpeed'
class Turret {
    constructor(type, damage, cooldown, accuracy, range) {
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
    }
    static standardTurret() {
        //Low Damage - Medium Fire Rate - Low Radius
        return new Turret("STANDARD", 1, 20, 1, 60);
    }
    static sniperTurret() {
        //High Damage - Low Fire Rate - High Radius
        return new Turret("SNIPER", 2, 50, 1, 120);
    }
    static machineGunTurret() {
        //Low Damage - High Fire Rate - Medium Radius
        return new Turret("MACHINE_GUN", 1, 6, 0.8, 80);
    }
    static laserTurret() {
        //High Damage - High Fire Rate - High Radius
        return new Turret("LASER", 2, 10, 0.9, 100);
    }
}