using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using MVA_FOOD.Core;

namespace MVA_FOOD.Infrastructure.Services
{
    public static class FacturaPdfGenerator
    {
        public static byte[] Generate(Core.Entities.Factura factura)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var simbolo = MonedaHelper.MonedaToSimbolo(factura.Moneda);

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(30);

                    page.Header().Text("Mr. Menús").FontSize(20).Bold().FontColor(Color.FromHex("#EA580C"));

                    page.Content().Column(col =>
                    {
                        col.Spacing(10);

                        col.Item().Text($"Factura N°: {factura.NumeroFactura}").FontSize(14).Bold();

                        col.Item().Text($"Cliente: {factura.Restaurante.Name}");
                        col.Item().Text($"Dirección: {factura.Restaurante.Direccion}");
                        col.Item().Text($"Teléfono: {factura.Restaurante.Phone}");
                        col.Item().Text($"Fecha de emisión: {factura.FechaEmision:dd/MM/yyyy}");

                        col.Item().PaddingTop(10).LineHorizontal(1);

                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text("Concepto").Bold();
                            row.ConstantItem(80).AlignRight().Text("Monto").Bold();
                        });

                        col.Item().LineHorizontal(1);

                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text(factura.Concepto);
                            row.ConstantItem(80).AlignRight().Text($"{simbolo}{factura.Monto:N2}");
                        });

                        col.Item().LineHorizontal(1);

                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text("Total:").Bold().FontSize(12);
                            row.ConstantItem(80).AlignRight().Text($"{simbolo}{factura.Monto:N2}").Bold().FontSize(12);
                        });

                        if (factura.Pagado)
                        {
                            col.Item().PaddingTop(10).Text("PAGADO").FontSize(14).Bold().FontColor(Colors.Green.Darken1);
                            if (factura.FechaPago.HasValue)
                                col.Item().Text($"Pagado el {factura.FechaPago:dd/MM/yyyy}");
                        }
                        else
                        {
                            col.Item().PaddingTop(10).Text("PENDIENTE DE PAGO").FontSize(14).Bold().FontColor(Colors.Red.Darken1);
                        }
                    });

                    page.Footer().AlignCenter().Text("Mr. Menús - www.mr-menus.com").FontSize(8).FontColor(Colors.Grey.Darken1);
                });
            }).GeneratePdf();
        }
    }
}
