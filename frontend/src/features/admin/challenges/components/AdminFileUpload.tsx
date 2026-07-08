import { useState, useRef } from 'react'
import { useAdminFiles, useUploadFile, useDeleteFile } from '../hooks/useAdminChallenges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Trash2, AlertCircle, FileIcon } from 'lucide-react'

interface AdminFileUploadProps {
  challengeId: number
}

export function AdminFileUpload({ challengeId }: AdminFileUploadProps) {
  const { data: files, isLoading, error } = useAdminFiles(challengeId)
  const uploadFile = useUploadFile()
  const deleteFile = useDeleteFile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!selectedFile) return
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('challenge_id', String(challengeId))
    await uploadFile.mutateAsync({ challengeId, formData })
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDelete = async (fileId: number) => {
    await deleteFile.mutateAsync({ id: fileId, challengeId })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load files</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Files</h3>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadFile.isPending}
        >
          <Upload className="h-4 w-4 mr-1" />
          {uploadFile.isPending ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      {files && files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>SHA1</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files?.map((file) => (
              <TableRow key={file.id}>
                <TableCell className="font-mono text-xs">{file.id}</TableCell>
                <TableCell className="max-w-[300px] truncate">
                  <div className="flex items-center gap-2">
                    <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-mono text-xs">{file.location}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs max-w-[150px] truncate">
                  {file.sha1sum}
                </TableCell>
                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this file?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(file.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
