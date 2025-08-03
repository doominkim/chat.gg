import {Box} from "@cloudscape-design/components";
export default function NotFound() {
  return (
    <Box
      textAlign="center"
      fontSize="heading-l"
      color="text-status-error"
      margin={{ top: "xxxl" }}
    >
      🚫 해당하는 유저가 없습니다 !
    </Box>
  );
}