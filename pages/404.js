import appConfig from "../config.json";
import { Box, Button, Text, TextField, Image } from "@skynexui/components";

export default function _404() {
    // https://cdn.pixabay.com/photo/2020/05/06/21/39/black-cat-5139322_960_720.jpg
    return (
        <>
          <Box
            styleSheet={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              width: "100%",
              height: "100%",
              maxWidth: "346px",
              maxHeight: "195px",
              borderRadius: "5px",
              padding: "32px",
              margin: "16px",
              //boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
              backgroundColor: appConfig.theme.colors.primary[500],
              backgroundImage:
              "url(https://cdn.pixabay.com/photo/2020/05/06/21/39/black-cat-5139322_960_720.jpg)",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundBlendMode: "multiply",

            }}
          >
          </Box>
        </>
      );
}

