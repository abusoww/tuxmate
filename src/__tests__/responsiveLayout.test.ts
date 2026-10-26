import { describe, expect, it } from 'vitest';
import { getAppGridColumnCount } from '@/lib/responsiveLayout';

describe('getAppGridColumnCount', () => {
    it('uses two columns until there is room for three 280px columns', () => {
        expect(getAppGridColumnCount(1024)).toBe(2);
        expect(getAppGridColumnCount(1371)).toBe(2);
        expect(getAppGridColumnCount(1372)).toBe(3);
    });

    it('uses three columns until there is room for four 280px columns', () => {
        expect(getAppGridColumnCount(1683)).toBe(3);
        expect(getAppGridColumnCount(1684)).toBe(4);
    });
});
