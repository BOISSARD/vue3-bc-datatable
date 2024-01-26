

export function cloneDeep<T extends object>(source: T, map = new WeakMap()): T {
    if (source === null || typeof source !== 'object') {
        return source;
    }

    if (map.has(source)) {
        return map.get(source);
    }

    const target: any = Array.isArray(source) ? [] : {};
    map.set(source, target);

    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            const value = source[key];
            target[key] = typeof value === 'object' ? cloneDeep(value as any, map) : value;
        }
    }

    return target as T;
}


export function merge<T extends object>(target: T, ...sources: object[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (typeof target !== 'object' || target === null) return target;

    if (source) {
        for (const key in source) {
            if (source.hasOwnProperty(key)) {
                const value = source[key];

                if (value && typeof value === 'object' && !(value instanceof Array)) {
                    if (!target[key] || typeof target[key] !== 'object' || target[key] instanceof Array) {
                        target[key] = {};
                    }
                    merge(target[key] as any, value);
                } else {
                    target[key] = value;
                }
            }
        }
    }

    return merge(target, ...sources);
}