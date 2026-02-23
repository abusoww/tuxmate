import nixUnfreeList from './nix-unfree.json';



const UNFREE_PACKAGES = new Set(nixUnfreeList.packages);

export function isUnfreePackage(pkg: string): boolean {
    const cleanPkg = pkg.trim().toLowerCase();

    if (UNFREE_PACKAGES.has(cleanPkg)) return true;

    for (const unfreePkg of Array.from(UNFREE_PACKAGES)) {
        if (cleanPkg.includes(unfreePkg)) return true;
    }

    return false;
}
