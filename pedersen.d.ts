declare class ProjectivePoint {
    constructor(x: string | number | bigint, y: string | number | bigint);
    double(): ProjectivePoint;
    add(point: ProjectivePoint): ProjectivePoint;
    equals(point: ProjectivePoint): boolean;
    toRawBytes(): Buffer;
}

declare function pedersen(x: bigint, y: bigint): bigint;

export { ProjectivePoint, pedersen };
