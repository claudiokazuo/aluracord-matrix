import { Box, Text, TextField, Image, Button } from "@skynexui/components";
import React, { useEffect, useState } from "react";
import appConfig from "../config.json";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import { ButtonSendSticker } from "../src/components/ButtonSendSticker";

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagemEmTempoReal(faz) {
  return supabaseClient
    .from("mensagens")
    .on("INSERT", (response) => {
      const mensagem = response.new;
      console.log("Houve uma nova mensagem", mensagem);
      faz("INSERT", mensagem);
    })
    .on("DELETE", (response) => {
      const id = response.old.id;
      console.log("Houve a exclusão de uma mensagem", id);
      faz("DELETE", id);
    })
    .subscribe();
}

export default function ChatPage() {
  const [mensagem, setMensagem] = React.useState("");
  const [listaMensagem, setListaMensagem] = React.useState([]);
  const router = useRouter();
  const username = router.query.username;
  const [hover, setHover] = useState(false);

  const callbackAfterInsert = (novaMensagem) => {
    setListaMensagem((listaAtual) => {
      return [novaMensagem, ...listaAtual];
    });
  };

  const callbackAfterDelete = (id) => {
    setListaMensagem((listaAtual) => {
      return listaAtual.filter((mensagem) => {
        return mensagem.id !== id;
      });
    });
  };

  const callbacks = {
    INSERT: callbackAfterInsert,
    DELETE: callbackAfterDelete,
  };
  useEffect(() => {
    supabaseClient
      .from("mensagens")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        console.log("dados da consulta", data);
        setListaMensagem(data);
      });

    const subscription = escutaMensagemEmTempoReal((acao, dados) => {
      console.log("Ação", acao);
      console.log("Nova mensagem", dados);
      callbacks[acao](dados);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleHover = (value) => {
    setHover(value);
  };
  // Sua lógica vai aqui

  const handleExcluiMensagem = (id) => {
    supabaseClient
      .from("mensagens")
      .delete()
      .match({ id: id })
      .then((response) => {
        console.log("Excluir", response);
        // const novaListaMensagem = listaMensagem.filter((mensagem) => {
        //   return mensagem.id !== id;
        // });
        // setListaMensagem(novaListaMensagem);
      });
  };

  const handleNovaMensagem = (novaMensagem) => {
    console.log(novaMensagem);
    const mensagem = {
      de: username,
      texto: novaMensagem,
    };

    if (novaMensagem !== "") {
      supabaseClient
        .from("mensagens")
        .insert(mensagem)
        .then(({ data }) => {
          console.log("Criando mensagem", data[0]);
          //   setListaMensagem([data[0], ...listaMensagem]);
          setMensagem("");
        });
    }
  };

  return (
    <>
      <Box
        styleSheet={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          boxShadow: "0 2px 10px 0 rgb(0 0 0 / 20%)",
          borderRadius: "5px",
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: "100%",
          maxWidth: "95%",
          maxHeight: "95vh",
          padding: "32px",
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: "relative",
            display: "flex",
            flex: 1,
            height: "80%",
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: "column",
            borderRadius: "5px",
            padding: "16px",
          }}
        >
          {/* {listaMensagem.map((mensagem) => {
            return (
              <li key={mensagem.id}>
                {mensagem.de}: {mensagem.texto}
              </li>);
          })} */}

          <MessageList
            mensagens={listaMensagem}
            username={username}
            excluir={handleExcluiMensagem}
            posicionar={handleHover}
          />

          <Box
            as="form"
            styleSheet={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <TextField
              value={mensagem}
              onChange={(e) => {
                const valor = e.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: "100%",
                border: "0",
                resize: "none",
                borderRadius: "5px",
                padding: "6px 8px",
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: "12px",
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            <Button
              variant="tertiary"
              colorVariant="primary"
              label="Enviar"
              onClick={(e) => {
                e.preventDefault();
                handleNovaMensagem(mensagem);
              }}
            />
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                console.log("Salva esse sticker no banco", sticker);
                handleNovaMensagem(`:sticker:${sticker}`);
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}

function Header() {
  return (
    <>
      <Box
        styleSheet={{
          width: "100%",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: "white",
        }}
      >
        <Text variant="heading5">Chat</Text>
        <Button
          variant="tertiary"
          colorVariant="neutral"
          label="Logout"
          href="/"
        />
      </Box>
    </>
  );
}

function MessageList(props) {
  //console.log("MessageList", props);
  return (
    <Box
      tag="ul"
      styleSheet={{
        overflow: "scroll",
        display: "flex",
        flexDirection: "column-reverse",
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: "16px",
      }}
    >
      {props.mensagens.length === 0 && (
        <Image
          styleSheet={{
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            display: "flex",
          }}
          src={"https://c.tenor.com/Jw8I___MCdQAAAAC/matrix-dodge.gif"}
        />
      )}
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: "5px",
              padding: "6px",
              marginBottom: "12px",
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              },
            }}
          >
            <Box
              styleSheet={{
                marginBottom: "8px",
              }}
            >
              <Image
                styleSheet={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: "8px",
                }}
                src={`https://github.com/${mensagem.de}.png`}
                onMouseOver={(e) => {
                  props.posicionar(true);
                }}
                onMouseOut={(e) => {
                  props.posicionar(false);
                }}
              />
              <Text tag="strong">{mensagem.de}</Text>
              <Text
                styleSheet={{
                  fontSize: "10px",
                  marginLeft: "8px",
                  color: appConfig.theme.colors.neutrals[300],
                }}
                tag="span"
              >
                {new Date().toLocaleDateString()}
              </Text>
              <Button
                variant="tertiary"
                colorVariant="light"
                label="Excluir"
                onClick={(e) => {
                  e.preventDefault();
                  console.log(props);
                  props.excluir(mensagem.id);
                }}
              />
            </Box>
            {mensagem.texto.startsWith(":sticker:") ? (
              <Image
                styleSheet={{
                  width: "100px",
                  height: "100px",
                }}
                src={mensagem.texto.replace(":sticker:", "")}
              />
            ) : (
              mensagem.texto
            )}
          </Text>
        );
      })}
    </Box>
  );
}
