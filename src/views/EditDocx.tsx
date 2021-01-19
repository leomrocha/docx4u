interface EditDocxProps {
  fullPath: string;
  base64Content: string;
}
export default function EditDocx(props: EditDocxProps) {
  return <div> {props.fullPath} </div>;
}
