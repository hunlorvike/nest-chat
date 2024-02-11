import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected async getTracker(req: Record<string, any>): Promise<string> {
        try {
            console.log('Inside ThrottlerBehindProxyGuard');
            console.log('Client IPs:', req.ips);
            const tracker = req.ips.length ? req.ips[0] : req.ip;
            console.log('Throttle Tracker:', tracker);
            return tracker;
        } catch (error) {
            console.error('Error in ThrottlerBehindProxyGuard:', error.message);
            throw new InternalServerErrorException('Failed to get throttler tracker');
        }
    }
}
