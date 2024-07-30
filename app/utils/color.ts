type Color = {
    r: number;
    g: number;
    b: number;
}

export function getRandomColor(arr1: number[], arr2: number[]) {
    const rgbA: Color = { r: arr1[0], g: arr1[1], b: arr1[2] };
    const rgbB: Color = { r: arr2[0], g: arr2[1], b: arr2[2] };
    // 生成一个 0 到 1 之间的随机数
    const t = Math.random();

    // 插值计算
    const r = Math.round(rgbA.r * (1 - t) + rgbB.r * t);
    const g = Math.round(rgbA.g * (1 - t) + rgbB.g * t);
    const b = Math.round(rgbA.b * (1 - t) + rgbB.b * t);

    return `rgb(${r}, ${g}, ${b})`;
}