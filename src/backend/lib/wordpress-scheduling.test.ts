import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { publishWordPressPost } from './wordpress';

vi.mock('axios');

describe('WordPress Scheduling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should include date field in payload when provided', async () => {
        const credentials = {
            url: 'https://example.com',
            username: 'user',
            password: 'password'
        };

        const post = {
            title: 'Scheduled Post',
            content: 'Content',
            status: 'draft' as const,
            date: '2025-12-25T10:00:00.000Z'
        };

        // Mock success response
        (axios.post as any).mockResolvedValue({
            status: 201,
            data: {
                id: 123,
                link: 'https://example.com/p/123'
            }
        });

        await publishWordPressPost(credentials, post);

        expect(axios.post).toHaveBeenCalledWith(
            'https://example.com/wp-json/wp/v2/posts',
            expect.objectContaining({
                title: 'Scheduled Post',
                content: expect.stringContaining('Content'),
                date: '2025-12-25T10:00:00.000Z'
            }),
            expect.any(Object)
        );
    });

    it('should NOT include date field when NOT provided', async () => {
        const credentials = {
            url: 'https://example.com',
            username: 'user',
            password: 'password'
        };

        const post = {
            title: 'Immediate Post',
            content: 'Content',
            status: 'publish' as const
        };

        (axios.post as any).mockResolvedValue({
            status: 201,
            data: { id: 1, link: '' }
        });

        await publishWordPressPost(credentials, post);

        // Verify date is undefined in the call
        const callArgs = (axios.post as any).mock.calls[0][1];
        expect(callArgs.date).toBeUndefined();
    });
});
