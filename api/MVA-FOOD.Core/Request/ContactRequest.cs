
namespace MVA_FOOD.Core.Request
{
    public class ContactRequest
    {
        public string FromName { get; set; } = string.Empty;
        public string FromLastName { get; set; } = string.Empty;
        public string ReplyTo { get; set; } = string.Empty;
        public string ReplyPhone { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
}