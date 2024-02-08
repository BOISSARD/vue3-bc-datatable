
export function normalize(str: string) {
    return str?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, "")
}

