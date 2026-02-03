import { NextRequest, NextResponse } from 'next/server';
import { getStorageUrl } from '@/helpers/storage';


export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path } = await params;
    const pathString = path.join('/');
    // Map the path to the Laravel storage URL
    const backendUrl = getStorageUrl(pathString);

    try {
        const response = await fetch(backendUrl);

        if (!response.ok) {
            return new NextResponse('File not found', { status: response.status });
        }

        const blob = await response.blob();
        const headers = new Headers();
        
        const contentType = response.headers.get('Content-Type');
        if (contentType) {
            headers.set('Content-Type', contentType);
        } else {
             headers.set('Content-Type', 'application/pdf');
        }
        
        const contentLength = response.headers.get('Content-Length');
        if (contentLength) headers.set('Content-Length', contentLength);

        // Add CORS headers just in case
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
