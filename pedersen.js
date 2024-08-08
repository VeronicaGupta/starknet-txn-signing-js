const { ec: EC } = require('elliptic');
const BN = require('bn.js');

const curve = new EC('secp256k1');
const curveOrder = new BN('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141', 16);

class ProjectivePoint {
    constructor(x, y) {
        this.x = new BN(x);
        this.y = new BN(y);
    }

    double() {
        const point = curve.curve.point(this.x, this.y);
        const doubled = point.dbl();
        return new ProjectivePoint(doubled.getX().toString(10), doubled.getY().toString(10));
    }

    add(point) {
        const p1 = curve.curve.point(this.x, this.y);
        const p2 = curve.curve.point(point.x, point.y);
        const result = p1.add(p2);
        return new ProjectivePoint(result.getX().toString(10), result.getY().toString(10));
    }

    equals(point) {
        return this.x.eq(point.x) && this.y.eq(point.y);
    }

    toRawBytes() {
        return Buffer.concat([this.x.toArrayLike(Buffer), this.y.toArrayLike(Buffer)]);
    }
}

const PEDERSEN_POINTS = [
    new ProjectivePoint('2089986280348253421170679821480865132823066470938446095505822317253594081284', '1713931329540660377023406109199410414810705867260802078187082345529207694986'),
    new ProjectivePoint('996781205833008774514500082376783249102396023663454813447423147977397232763', '1668503676786377725805489344771023921079126552019160156920634619255970485781'),
    new ProjectivePoint('2251563274489750535117886426533222435294046428347329203627021249169616184184', '1798716007562728905295480679789526322175868328062420237419143593021674992973'),
    new ProjectivePoint('2138414695194151160943305727036575959195309218611738193261179310511854807447', '113410276730064486255102093846540133784865286929052426931474106396135072156'),
    new ProjectivePoint('2379962749567351885752724891227938183011949129833673362440656643086021394946', '776496453633298175483985398648758586525933812536653089401905292063708816422'),
];

function pedersenPrecompute(p1, p2) {
    const out = [];
    let p = p1;
    for (let i = 0; i < 248; i++) {
        out.push(p);
        p = p.double();
    }
    p = p2;
    for (let i = 0; i < 4; i++) {
        out.push(p);
        p = p.double();
    }
    return out;
}

const PEDERSEN_POINTS1 = pedersenPrecompute(PEDERSEN_POINTS[1], PEDERSEN_POINTS[2]);
const PEDERSEN_POINTS2 = pedersenPrecompute(PEDERSEN_POINTS[3], PEDERSEN_POINTS[4]);

function pedersenArg(arg) {
    let value;
    if (typeof arg === 'bigint') {
        value = new BN(arg.toString());
    } else if (typeof arg === 'number') {
        if (!Number.isSafeInteger(arg)) throw new Error(`Invalid pedersenArg: ${arg}`);
        value = new BN(arg);
    } else {
        value = new BN(arg); // Simplified for this example
    }
    if (!(new BN(0).lte(value) && value.lt(curveOrder))) {
        console.error(`Invalid pedersenArg value: ${value.toString()}`);
        throw new Error(`PedersenArg should be 0 <= value < curve order: ${value}`);
    }
    return value;
}

function pedersenSingle(point, value, constants) {
    let x = pedersenArg(value);
    console.log(`Starting pedersenSingle with x: ${x.toString()}`);
    for (let j = 0; j < 252; j++) {
        const pt = constants[j];
        if (pt.equals(point)) throw new Error('Same point');
        if (x.and(new BN(1)).isZero() === false) point = point.add(pt);
        x = x.shrn(1);
        console.log(`Intermediate x: ${x.toString()}`);
    }
    return point;
}

function extractX(rawBytes) {
    return BigInt('0x' + rawBytes.toString('hex'));
}

function pedersen(x, y) {
    console.log(`Pedersen inputs - x: ${x.toString()}, y: ${y.toString()}`);
    if (new BN(x.toString()).gte(curveOrder) || new BN(y.toString()).gte(curveOrder)) {
        throw new Error(`Pedersen inputs must be less than the curve order`);
    }

    let point = PEDERSEN_POINTS[0];
    console.log(`Initial point: (${point.x.toString()}, ${point.y.toString()})`);
    point = pedersenSingle(point, x, PEDERSEN_POINTS1);
    console.log(`After x: (${point.x.toString()}, ${point.y.toString()})`);
    point = pedersenSingle(point, y, PEDERSEN_POINTS2);
    console.log(`After y: (${point.x.toString()}, ${point.y.toString()})`);

    const result = extractX(point.toRawBytes());
    console.log(`Pedersen result: ${result.toString()}`);

    // Check if result is within the curve order
    if (new BN(result.toString()).gte(curveOrder)) {
        throw new Error(`Pedersen result exceeds curve order: ${result.toString()}`);
    }

    return result;
}

module.exports = { pedersen, ProjectivePoint };
