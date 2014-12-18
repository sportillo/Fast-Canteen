all: projector shutter light_sensor plugs temperature
CONTIKI=/home/user/contiki

UIP_CONF_IPV6=1
CFLAGS+=-DUIP_CONF_IPV6=1
CFLAGS+=-DUIP_CONF_IPV6_RPL=1
CFLAGS+=-DPROJECT_CONF_H=\"project-conf.h\"
CFLAGS+=-DWITH_COAP=13
CFLAGS+=-DREST=coap_rest_implementation
CFLAGS+=-DUIP_CONF_TCP=0
APPS+=er-coap-13
APPS+=erbium

include $(CONTIKI)/Makefile.include