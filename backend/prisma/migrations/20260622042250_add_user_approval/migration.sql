-- AlterTable
ALTER TABLE "User" ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifyOtp" TEXT,
ADD COLUMN     "verifyOtpExpiry" TIMESTAMP(3);
