import {GetObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {RenderInternals} from '@remotion/renderer';
import {AwsRegion} from '../../pricing/aws-regions';
import {getS3Client} from '../../shared/aws-clients';

export type LambdaReadFileProgress = (progress: {
	totalSize: number;
	downloaded: number;
	progress: number;
}) => unknown;

export const lambdaDownloadFileWithProgress = async ({
	bucketName,
	key,
	region,
	expectedBucketOwner,
	outputPath,
	onProgress,
}: {
	bucketName: string;
	key: string;
	region: AwsRegion;
	expectedBucketOwner: string;
	outputPath: string;
	onProgress: LambdaReadFileProgress;
}): Promise<{sizeInBytes: number}> => {
	const client = getS3Client(region);
	const command = new GetObjectCommand({
		Bucket: bucketName,
		ExpectedBucketOwner: expectedBucketOwner,
		Key: key,
	});

	const presigned = await getSignedUrl(client, command);

	return RenderInternals.downloadFile(presigned, outputPath, onProgress);
};